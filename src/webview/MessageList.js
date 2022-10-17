/* @flow strict-local */
import * as React from 'react';
import { Platform, NativeModules } from 'react-native';
import { WebView } from 'react-native-webview';

import { connectActionSheet } from '../react-native-action-sheet';
import type {
  Dispatch,
  Fetching,
  GetText,
  Message,
  Narrow,
  Outbox,
  MessageListElement,
  UserOrBot,
  EditMessage,
} from '../types';
import { assumeSecretlyGlobalState } from '../reduxTypes';
import type { ThemeData } from '../styles';
import { ThemeContext } from '../styles';
import { connect } from '../react-redux';
import {
  getCurrentTypingUsers,
  getDebug,
  getFetchingForNarrow,
  getGlobalSettings,
} from '../selectors';
import { withGetText } from '../boot/TranslationProvider';
import type { ShowActionSheetWithOptions } from '../action-sheets';
import { getMessageListElementsMemoized } from '../message/messageSelectors';
import type { WebViewInboundEvent } from './generateInboundEvents';
import type { WebViewOutboundEvent } from './handleOutboundEvents';
import getHtml from './html/html';
import messageListElementHtml from './html/messageListElementHtml';
import generateInboundEvents from './generateInboundEvents';
import { handleWebViewOutboundEvent } from './handleOutboundEvents';
import { base64Utf8Encode } from '../utils/encoding';
import { caseNarrow, isConversationNarrow } from '../utils/narrow';
import { type BackgroundData, getBackgroundData } from './backgroundData';
import { ensureUnreachable } from '../generics';
import SinglePageWebView from './SinglePageWebView';

type OuterProps = $ReadOnly<{|
  narrow: Narrow,
  messages: $ReadOnlyArray<Message | Outbox>,
  initialScrollMessageId: number | null,
  showMessagePlaceholders: boolean,
  startEditMessage: (editMessage: EditMessage) => void,
|}>;

type SelectorProps = {|
  // Data independent of the particular narrow or messages we're displaying.
  backgroundData: BackgroundData,

  // The remaining props contain data specific to the particular narrow or
  // particular messages we're displaying.  Data that's independent of those
  // should go in `BackgroundData`, above.
  fetching: Fetching,
  messageListElementsForShownMessages: $ReadOnlyArray<MessageListElement>,
  typingUsers: $ReadOnlyArray<UserOrBot>,
  doNotMarkMessagesAsRead: boolean,
|};

export type Props = $ReadOnly<{|
  ...OuterProps,

  dispatch: Dispatch,
  ...SelectorProps,

  // From `connectActionSheet`.
  showActionSheetWithOptions: ShowActionSheetWithOptions,

  // From `withGetText`.
  _: GetText,
|}>;

/**
 * The URL of the platform-specific assets folder.
 *
 * This will be a `file:` URL.
 */
// It could be perfectly reasonable for this to be an `http:` or `https:`
// URL instead, at least in development.  We'd then just need to adjust
// the `originWhitelist` we pass to `WebView`.
//
// - On iOS: We can't easily hardcode this because it includes UUIDs.
//   So we bring it over the React Native bridge in ZLPConstants.m.
//   It's a file URL because the app bundle's `resourceURL` is:
//     https://developer.apple.com/documentation/foundation/bundle/1414821-resourceurl
//
// - On Android: Different apps' WebViews see different (virtual) root
//   directories as `file:///`, and in particular the WebView provides
//   the APK's `assets/` directory as `file:///android_asset/`. [1]
//   We can easily hardcode that, so we do.
//
// [1] Oddly, this essential feature doesn't seem to be documented!  It's
//     widely described in how-tos across the web and StackOverflow answers.
//     It's assumed in some related docs which mention it in passing, and
//     treated matter-of-factly in some Chromium bug threads.  Details at:
//     https://chat.zulip.org/#narrow/stream/243-mobile-team/topic/android.20filesystem/near/796440
const assetsUrl =
  Platform.OS === 'ios'
    ? new URL(NativeModules.ZLPConstants.resourceURL)
    : new URL('file:///android_asset/');

/**
 * The URL of the webview-assets folder.
 *
 * This is the folder populated at build time by `tools/build-webview`.
 */
const webviewAssetsUrl = new URL('webview/', assetsUrl);

/**
 * Effective URL of the MessageList webview.
 *
 * It points to `index.html` in the webview-assets folder, which
 * doesn't exist.
 *
 * It doesn't need to exist because we provide all HTML at
 * creation (or refresh) time. This serves only as a placeholder,
 * so that relative URLs (e.g., to `base.css`, which does exist)
 * and cross-domain security restrictions have somewhere to
 * believe that this document originates from.
 */
const baseUrl = new URL('index.html', webviewAssetsUrl);

class MessageListInner extends React.Component<Props> {
  // NOTE: This component has an unusual lifecycle for a React component!
  //
  // In the React element which the render method returns, the bulk of
  // the interesting content is in one string, an HTML document, which will
  // get passed to a WebView.
  //
  // That WebView is a leaf of the tree that React sees.  But there's a lot
  // of structure inside that HTML string, and there's UI state (in
  // particular, the scroll position) in the resulting page in the browser.
  // So when the content that would go in that HTML changes, we don't want
  // to just replace the entire HTML document.  We want to use the structure
  // to make localized updates to the page in the browser, much as React
  // does automatically for changes in its tree.
  //
  // This is important not only for performance (computing all the HTML for
  // a long list of messages is expensive), but for correct behavior: if we
  // did change the HTML string passed to the WebView, the user would find
  // themself suddenly scrolled back to the bottom.
  //
  // So:
  //  * We let this component render just once, and define
  //    `shouldComponentUpdate` so as to mostly prevent re-renders.
  //    (We still re-render if the theme changes, though, and potentially at
  //    arbitrary other times; see docs/architecture/react.md .)
  //  * When the props change, we compute a set of events describing the
  //    changes, and send them to our code inside the webview to execute.
  //
  // See also docs/architecture/react.md .

  static contextType = ThemeContext;
  context: ThemeData;

  webviewRef = React.createRef<React$ElementRef<typeof WebView>>();
  sendInboundEventsIsReady: boolean;
  unsentInboundEvents: WebViewInboundEvent[] = [];

  /**
   * Send the given inbound-events to the inside-webview code.
   *
   * See `handleMessageEvent` in the inside-webview code for where these are
   * received and processed.
   */
  sendInboundEvents = (uevents: $ReadOnlyArray<WebViewInboundEvent>): void => {
    if (this.webviewRef.current !== null && uevents.length > 0) {
      /* $FlowFixMe[incompatible-type]: This `postMessage` is undocumented;
         tracking as #3572. */
      const secretWebView: { postMessage: (string, string) => void, ... } = this.webviewRef.current;
      secretWebView.postMessage(base64Utf8Encode(JSON.stringify(uevents)), '*');
    }
  };

  handleMessage = (event: { +nativeEvent: { +data: string, ... }, ... }) => {
    const eventData: WebViewOutboundEvent = JSON.parse(event.nativeEvent.data);
    if (eventData.type === 'ready') {
      this.sendInboundEventsIsReady = true;
      this.sendInboundEvents([{ type: 'ready' }, ...this.unsentInboundEvents]);
      this.unsentInboundEvents = [];
    } else {
      handleWebViewOutboundEvent(this.props, eventData);
    }
  };

  shouldComponentUpdate(nextProps) {
    // Account for the new props by sending any needed inbound-events to the
    // inside-webview code.
    const uevents = generateInboundEvents(this.props, nextProps);
    if (this.sendInboundEventsIsReady) {
      this.sendInboundEvents(uevents);
    } else {
      this.unsentInboundEvents.push(...uevents);
    }

    // Then, skip any React re-render.  See discussion at top of component.
    return false;
  }

  render() {
    // NB: This only runs once for a given component instance!
    //     See `shouldComponentUpdate`, and discussion at top of component.
    //
    // This means that all changes to props must be handled by
    // inbound-events, or they simply won't be handled at all.

    const {
      backgroundData,
      messageListElementsForShownMessages,
      initialScrollMessageId,
      showMessagePlaceholders,
      doNotMarkMessagesAsRead,
      _,
    } = this.props;
    const contentHtml = messageListElementsForShownMessages
      .map(element => messageListElementHtml({ backgroundData, element, _ }))
      .join('');
    const { auth } = backgroundData;
    const html: string = getHtml(
      contentHtml,
      this.context.themeName,
      {
        scrollMessageId: initialScrollMessageId,
        auth,
        showMessagePlaceholders,
        doNotMarkMessagesAsRead,
      },
      backgroundData.serverEmojiData,
    );

    return (
      <SinglePageWebView
        html={html}
        baseUrl={baseUrl}
        decelerationRate="normal"
        style={{ backgroundColor: 'transparent' }}
        ref={this.webviewRef}
        onMessage={this.handleMessage}
        onError={event => {
          console.error(event); // eslint-disable-line no-console
        }}
      />
    );
  }
}

/**
 * Whether reading messages in this narrow can mark them as read.
 *
 * "Can", not "will": other conditions can mean we don't want to mark
 * messages as read even when in a narrow where this is true.
 */
const marksMessagesAsRead = (narrow: Narrow): boolean =>
  // Generally we want these to agree with the web/desktop app, so that user
  // expectations transfer between the different apps.
  caseNarrow(narrow, {
    // These narrows show one conversation in full.  Each message appears
    // in its full context, so it makes sense to say the user's read it
    // and doesn't need to be shown it as unread again.
    topic: () => true,
    pm: () => true,

    // These narrows show several conversations interleaved.  They always
    // show entire conversations, so each message still appears in its
    // full context and it still makes sense to mark it as read.
    stream: () => true,
    home: () => true,
    allPrivate: () => true,

    // These narrows show selected messages out of context.  The user will
    // typically still want to see them another way, in context, before
    // letting them disappear from their list of unread messages.
    search: () => false,
    starred: () => false,
    mentioned: () => false,
  });

const MessageList: React.ComponentType<OuterProps> = connect<SelectorProps, _, _>(
  (state, props: OuterProps) => {
    // If this were a function component with Hooks, these would be
    // useGlobalSelector calls and would coexist perfectly smoothly with
    // useSelector calls for the per-account data.  As long as it's not,
    // they should probably turn into a `connectGlobal` call.
    const globalSettings = getGlobalSettings(assumeSecretlyGlobalState(state));
    const debug = getDebug(assumeSecretlyGlobalState(state));

    return {
      backgroundData: getBackgroundData(state, globalSettings, debug),
      fetching: getFetchingForNarrow(state, props.narrow),
      messageListElementsForShownMessages: getMessageListElementsMemoized(
        props.messages,
        props.narrow,
      ),
      typingUsers: getCurrentTypingUsers(state, props.narrow),
      doNotMarkMessagesAsRead:
        !marksMessagesAsRead(props.narrow)
        || (() => {
          switch (globalSettings.markMessagesReadOnScroll) {
            case 'always':
              return false;
            case 'never':
              return true;
            case 'conversation-views-only':
              return !isConversationNarrow(props.narrow);
            default:
              ensureUnreachable(globalSettings.markMessagesReadOnScroll);
              return false;
          }
        })(),
    };
  },
)(connectActionSheet(withGetText(MessageListInner)));

export default MessageList;
