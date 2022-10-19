/* @flow strict-local */
import * as React from 'react';
import { useContext } from 'react';
import { Platform, NativeModules } from 'react-native';
import { WebView } from 'react-native-webview';
// $FlowFixMe[untyped-import]
import { useActionSheet } from '@expo/react-native-action-sheet';

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
import { ThemeContext } from '../styles';
import { useSelector, useDispatch } from '../react-redux';
import {
  getCurrentTypingUsers,
  getDebug,
  getFetchingForNarrow,
  getGlobalSettings,
} from '../selectors';
import { TranslationContext } from '../boot/TranslationProvider';
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
import { usePrevious } from '../reactUtils';

/**
 * The actual React props for the MessageList component.
 */
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

/**
 * All the data for rendering the message list, and callbacks for its UI actions.
 *
 * This data gets used for rendering the initial HTML and for computing
 * inbound-events to update the page.  Then the handlers for the message
 * list's numerous UI actions -- both for user interactions inside the page
 * as represented by outbound-events, and in action sheets -- use the data
 * and callbacks in order to do their jobs.
 *
 * This can be thought of -- hence the name -- as the React props for a
 * notional inner component, like we'd have if we obtained this data through
 * HOCs like `connect` and `withGetText`.  (Instead, we use Hooks, and don't
 * have a separate inner component.)
 */
export type Props = $ReadOnly<{|
  ...OuterProps,

  dispatch: Dispatch,
  ...SelectorProps,

  showActionSheetWithOptions: ShowActionSheetWithOptions,

  _: GetText,
|}>;

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

function getSelectorProps(state, props) {
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
}

function useMessageListProps(outerProps: OuterProps): Props {
  const _ = useContext(TranslationContext);
  const showActionSheetWithOptions: ShowActionSheetWithOptions =
    useActionSheet().showActionSheetWithOptions;
  const dispatch = useDispatch();
  const selectorProps = useSelector(state => getSelectorProps(state, outerProps));

  return {
    ...outerProps,
    showActionSheetWithOptions,
    _,
    dispatch,
    ...selectorProps,
  };
}

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

export default function MessageList(outerProps: OuterProps): React.Node {
  // NOTE: This component has an unusual lifecycle for a React component!
  //
  // In the React element which this render function returns, the bulk of
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
  //  * We compute the HTML document just once and then always re-use that
  //    initial value.
  //  * When the props change, we compute a set of events describing the
  //    changes, and send them to our code inside the webview to execute.
  //
  // See also docs/architecture/react.md .

  const props = useMessageListProps(outerProps);

  const theme = React.useContext(ThemeContext);

  const webviewRef = React.useRef<React$ElementRef<typeof WebView> | null>(null);
  const sendInboundEventsIsReady = React.useRef<boolean>(false);
  const unsentInboundEvents = React.useRef<WebViewInboundEvent[]>([]);

  /**
   * Send the given inbound-events to the inside-webview code.
   *
   * See `handleMessageEvent` in the inside-webview code for where these are
   * received and processed.
   */
  const sendInboundEvents = React.useCallback(
    (uevents: $ReadOnlyArray<WebViewInboundEvent>): void => {
      if (webviewRef.current !== null && uevents.length > 0) {
        /* $FlowFixMe[incompatible-type]: This `postMessage` is undocumented;
         tracking as #3572. */
        const secretWebView: { postMessage: (string, string) => void, ... } = webviewRef.current;
        secretWebView.postMessage(base64Utf8Encode(JSON.stringify(uevents)), '*');
      }
    },
    [],
  );

  const propsRef = React.useRef(props);
  React.useEffect(() => {
    const lastProps = propsRef.current;
    if (props === lastProps) {
      // Nothing to update.  (This happens in particular on first render.)
      return;
    }
    propsRef.current = props;

    // Account for the new props by sending any needed inbound-events to the
    // inside-webview code.
    const uevents = generateInboundEvents(lastProps, props);
    if (sendInboundEventsIsReady.current) {
      sendInboundEvents(uevents);
    } else {
      unsentInboundEvents.current.push(...uevents);
    }
  }, [props, sendInboundEvents]);

  const handleMessage = React.useCallback(
    (event: { +nativeEvent: { +data: string, ... }, ... }) => {
      const eventData: WebViewOutboundEvent = JSON.parse(event.nativeEvent.data);
      if (eventData.type === 'ready') {
        sendInboundEventsIsReady.current = true;
        sendInboundEvents([{ type: 'ready' }, ...unsentInboundEvents.current]);
        unsentInboundEvents.current = [];
      } else {
        // Instead of closing over `props` itself, we indirect through
        // `propsRef`, which gets updated by the effect above.
        //
        // That's because unlike in a typical component, the UI this acts as
        // a UI callback for isn't based on the current props, but on the
        // data we've communicated through inbound-events.  (See discussion
        // at top of component.)  So that's the data we want to refer to
        // when interpreting the user's interaction; and `propsRef` is what
        // the effect above updates in sync with sending those events.
        //
        // (The distinction may not matter much here in practice.  But a
        // nice bonus of this way is that we avoid re-renders of
        // SinglePageWebView, potentially a helpful optimization.)
        handleWebViewOutboundEvent(propsRef.current, eventData);
      }
    },
    [sendInboundEvents],
  );

  // We compute the page contents as an HTML string just once (*), on this
  // MessageList's first render.  See discussion at top of function.
  //
  // Note this means that all changes to props must be handled by
  // inbound-events, or they simply won't be handled at all.
  //
  // (*) The logic below doesn't quite look that way -- what it says is that
  //     we compute the HTML on first render, and again any time the theme
  //     changes.  Until we implement #5533, this comes to the same thing,
  //     because the only way to change the theme is for the user to
  //     navigate out to our settings UI.  We write it this way so that it
  //     won't break with #5533.
  //
  //     On the other hand, this means that if the theme changes we'll get
  //     the glitch described at top of function, scrolling the user to the
  //     bottom.  Better than mismatched themes, but not ideal.  A nice bonus
  //     followup on #5533 would be to add an inbound-event for changing the
  //     theme, and then truly compute the HTML just once.
  const htmlRef = React.useRef(null);
  const prevTheme = usePrevious(theme);
  if (htmlRef.current == null || theme !== prevTheme) {
    const {
      backgroundData,
      messageListElementsForShownMessages,
      initialScrollMessageId,
      showMessagePlaceholders,
      doNotMarkMessagesAsRead,
      _,
    } = props;
    const contentHtml = messageListElementsForShownMessages
      .map(element => messageListElementHtml({ backgroundData, element, _ }))
      .join('');
    const { auth } = backgroundData;
    htmlRef.current = getHtml(
      contentHtml,
      theme.themeName,
      {
        scrollMessageId: initialScrollMessageId,
        auth,
        showMessagePlaceholders,
        doNotMarkMessagesAsRead,
      },
      backgroundData.serverEmojiData,
    );
  }

  return (
    <SinglePageWebView
      html={htmlRef.current}
      baseUrl={baseUrl}
      decelerationRate="normal"
      style={React.useMemo(() => ({ backgroundColor: 'transparent' }), [])}
      ref={webviewRef}
      onMessage={handleMessage}
      onError={React.useCallback(event => {
        console.error(event); // eslint-disable-line no-console
      }, [])}
    />
  );
}
