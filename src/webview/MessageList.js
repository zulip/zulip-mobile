/* @flow strict-local */
import React, { Component } from 'react';
import { Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewNavigation } from 'react-native-webview';

import { connectActionSheet } from '@expo/react-native-action-sheet';

import type {
  AlertWordsState,
  Auth,
  Context,
  Debug,
  Dispatch,
  Fetching,
  FlagsState,
  GetText,
  Message,
  MuteState,
  Narrow,
  Outbox,
  ImageEmojiType,
  RenderedSectionDescriptor,
  Subscription,
  ThemeName,
  User,
} from '../types';
import { connect } from '../react-redux';
import {
  getAuth,
  getAllImageEmojiById,
  getCurrentTypingUsers,
  getDebug,
  getRenderedMessages,
  getFlags,
  getAnchorForNarrow,
  getFetchingForNarrow,
  getMute,
  getOwnEmail,
  getOwnUser,
  getSettings,
  getSubscriptions,
  getShowMessagePlaceholders,
  getShownMessagesForNarrow,
  getRealm,
} from '../selectors';
import { withGetText } from '../boot/TranslationProvider';

import type { ShowActionSheetWithOptions } from '../message/messageActionSheet';
import type { WebViewUpdateEvent } from './webViewHandleUpdates';
import type { MessageListEvent } from './webViewEventHandlers';
import getHtml from './html/html';
import renderMessagesAsHtml from './html/renderMessagesAsHtml';
import { getUpdateEvents } from './webViewHandleUpdates';
import { handleMessageListEvent } from './webViewEventHandlers';
import { base64Utf8Encode } from '../utils/encoding';
import * as logging from '../utils/logging';

// ESLint doesn't notice how `this.props` escapes, and complains about some
// props not being used here.
/* eslint-disable react/no-unused-prop-types */

/**
 * Data about the user, the realm, and all known messages.
 *
 * This data is all independent of the specific narrow or specific messages
 * we're displaying; data about those goes elsewhere.
 */
export type BackgroundData = $ReadOnly<{
  alertWords: AlertWordsState,
  auth: Auth,
  debug: Debug,
  flags: FlagsState,
  mute: MuteState,
  ownEmail: string,
  ownUserId: number,
  allImageEmojiById: $ReadOnly<{ [id: string]: ImageEmojiType }>,
  twentyFourHourTime: boolean,
  subscriptions: Subscription[],
}>;

type SelectorProps = {|
  backgroundData: BackgroundData,
  anchor: number,
  fetching: Fetching,
  messages: $ReadOnlyArray<Message | Outbox>,
  renderedMessages: RenderedSectionDescriptor[],
  showMessagePlaceholders: boolean,
  theme: ThemeName,
  typingUsers: $ReadOnlyArray<User>,
|};

// TODO get a type for `connectActionSheet` so this gets fully type-checked.
export type Props = {|
  narrow: Narrow,

  dispatch: Dispatch,
  ...SelectorProps,

  // From `connectActionSheet`.
  showActionSheetWithOptions: ShowActionSheetWithOptions,

  // From `withGetText`.
  _: GetText,
|};

/**
 * The path to the webview assets, represented as a `file:`-scheme URL.
 *
 * This may be a relative URL, relative to whatever base URL a `WebView`
 * component will use to interpret its own `source.baseUrl` prop.  (If
 * relative, the scheme naturally is left implicit.)
 *
 * See the `tools/build-webview` script for more details.
 *
 * Because this URL may be relative, it shouldn't be used anywhere *other*
 * than the `source.baseUrl` of a `WebView` component.  In particular, it
 * shouldn't be used for URLs in the browser environment within the
 * `WebView`; to reach the webview assets there, just use `./`.
 */
// On iOS, a typical value to use here might be expressed like (in Swift)
// `Bundle.main.resourceURL`.  But there's no convenient way to get that
// from inside RN (and it doesn't seem worth linking something like
// react-native-fs for); and unlike on Android, it's not fixed enough to be
// able to just hardcode.
//
// Fortunately, on iOS the `WebView` will accept a relative URL for this
// value!  This behavior seems a bit mysterious -- it doesn't appear to be
// documented -- but the mysterious base URL for the base URL takes a
// convenient enough value we can just use that.  (The `WebView`
// implementation on iOS passes `source.baseUrl` straight through to
// `baseURL` here:
//   https://developer.apple.com/documentation/webkit/wkwebview/1415004-loadhtmlstring
// but there's no indication that that can be relative, or if so what it is
// treated as relative to.)
const assetsPath = Platform.OS === 'ios' ? './webview' : 'file:///android_asset/webview';

class MessageList extends Component<Props> {
  context: Context;
  webview: ?WebView;
  sendUpdateEventsIsReady: boolean;
  unsentUpdateEvents: WebViewUpdateEvent[] = [];

  static contextTypes = {
    styles: () => null,
    theme: () => null,
  };

  componentDidMount() {
    this.setupSendUpdateEvents();
  }

  handleError = (event: mixed) => {
    console.error(event); // eslint-disable-line
  };

  /**
   * Initiate round-trip handshakes with the WebView, until one succeeds.
   */
  setupSendUpdateEvents = (): void => {
    const intervalId = setInterval(() => {
      if (!this.sendUpdateEventsIsReady) {
        this.sendUpdateEvents([{ type: 'ready' }]);
      } else {
        clearInterval(intervalId);
      }
    }, 30);
  };

  sendUpdateEvents = (uevents: WebViewUpdateEvent[]): void => {
    if (this.webview && uevents.length > 0) {
      // $FlowFixMe This `postMessage` is undocumented; tracking as #3572.
      const secretWebView: { postMessage: (string, string) => void } = this.webview;
      secretWebView.postMessage(base64Utf8Encode(JSON.stringify(uevents)), '*');
    }
  };

  handleMessage = (event: { +nativeEvent: { +data: string } }) => {
    const eventData: MessageListEvent = JSON.parse(event.nativeEvent.data);
    if (eventData.type === 'ready') {
      this.sendUpdateEventsIsReady = true;
      this.sendUpdateEvents(this.unsentUpdateEvents);
    } else {
      const { _ } = this.props;
      handleMessageListEvent(this.props, _, eventData);
    }
  };

  shouldComponentUpdate = (nextProps: Props) => {
    const uevents = getUpdateEvents(this.props, nextProps);

    if (this.sendUpdateEventsIsReady) {
      this.sendUpdateEvents(uevents);
    } else {
      this.unsentUpdateEvents.push(...uevents);
    }

    return false;
  };

  render() {
    const { styles: contextStyles } = this.context;
    const {
      backgroundData,
      renderedMessages,
      anchor,
      narrow,
      theme,
      showMessagePlaceholders,
    } = this.props;
    const messagesHtml = renderMessagesAsHtml(backgroundData, narrow, renderedMessages);
    const { auth } = backgroundData;
    const html = getHtml(messagesHtml, theme, {
      anchor,
      auth,
      showMessagePlaceholders,
    });

    /**
     * Effective URL of the MessageList webview.
     *
     * We provide all HTML at creation (or refresh) time; the document named
     * here is not loaded, and doesn't even need to exist. It serves only as a
     * placeholder, so that relative URLs and cross-domain security restrictions
     * have somewhere to believe that this document originates from.
     */
    const baseUrl = `${assetsPath}/index.html`;

    // Paranoia^WSecurity: only load `baseUrl`, and only load it once. Any other
    // requests should be handed off to the OS, not loaded inside the WebView.
    const onShouldStartLoadWithRequest: (event: WebViewNavigation) => boolean = (() => {
      // Inner closure to actually test the URL.
      const urlTester: (url: string) => boolean = (() => {
        // On Android this function is documented to be skipped on first load:
        // therefore, simply never return true.
        if (Platform.OS === 'android') {
          return (url: string) => false;
        }

        // Otherwise (for iOS), return a closure that evaluates to `true` _exactly
        // once_, and even then only if the URL looks like what we're expecting.
        let loaded_once = false;
        // The baseUrl, with its relative portion (if any) stripped.
        const baseUrlTail = baseUrl.replace(/^\.\//, '');
        // Disallow such monstrosities as `evilsite.com/?./webview/index.html`.
        const unsafeUrlRegex = /[&?]/;
        return (url: string) => {
          if (!loaded_once) {
            // The exact URL that will be loaded could be determined statically on
            // Android. On iOS, though, it involves some unpredictable UUIDs which
            // RN provides no good interface to. (`react-native-fs` is awful.)
            if (
              url.startsWith('file://')
              && url.endsWith(baseUrlTail)
              && !unsafeUrlRegex.test(url)
            ) {
              loaded_once = true;
              return true;
            }
          }
          return false;
        };
      })();

      // Outer closure to perform logging.
      return (event: WebViewNavigation) => {
        const ok = urlTester(event.url);
        if (!ok) {
          logging.warn(`webview: rejected navigation event: ${JSON.stringify({ ...event })};
    expected base URL = ${baseUrl}`);
        }
        return ok;
      };
    })();

    // The `originWhitelist` and `onShouldStartLoadWithRequest` props are
    // meant to mitigate possible XSS bugs, by interrupting an attempted
    // exploit if it tries to navigate to a new URL by e.g. setting
    // `window.location`.
    //
    // Note that neither of them is a hard security barrier; they're checked
    // only against the URL of the document itself.  They cannot be used to
    // validate the URL of other resources the WebView loads.
    //
    // Worse, the `originWhitelist` parameter is completely broken. See:
    // https://github.com/react-native-community/react-native-webview/pull/697
    return (
      <WebView
        useWebKit
        source={{ baseUrl, html }}
        originWhitelist={['file://']}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        style={contextStyles.webview}
        ref={webview => {
          this.webview = webview;
        }}
        onMessage={this.handleMessage}
        onError={this.handleError}
      />
    );
  }
}

type OuterProps = {|
  narrow: Narrow,

  /* Remaining props are derived from `narrow` by default. */

  messages?: Message[],
  renderedMessages?: RenderedSectionDescriptor[],
  anchor?: number,

  /* Passing these three from the parent is kind of a hack; search uses it
     to hard-code some behavior. */
  fetching?: Fetching,
  showMessagePlaceholders?: boolean,
  typingUsers?: User[],
|};

export default connect((state, props: OuterProps): SelectorProps => {
  // TODO Ideally this ought to be a caching selector that doesn't change
  // when the inputs don't.  Doesn't matter in a practical way here, because
  // we have a `shouldComponentUpdate` that doesn't look at this prop... but
  // it'd be better to set an example of the right general pattern.
  const backgroundData: BackgroundData = {
    alertWords: state.alertWords,
    auth: getAuth(state),
    debug: getDebug(state),
    flags: getFlags(state),
    mute: getMute(state),
    ownEmail: getOwnEmail(state),
    ownUserId: getOwnUser(state).user_id,
    allImageEmojiById: getAllImageEmojiById(state),
    subscriptions: getSubscriptions(state),
    twentyFourHourTime: getRealm(state).twentyFourHourTime,
  };

  return {
    backgroundData,
    anchor: props.anchor !== undefined ? props.anchor : getAnchorForNarrow(props.narrow)(state),
    fetching: props.fetching || getFetchingForNarrow(props.narrow)(state),
    messages: props.messages || getShownMessagesForNarrow(state, props.narrow),
    renderedMessages: props.renderedMessages || getRenderedMessages(props.narrow)(state),
    showMessagePlaceholders:
      props.showMessagePlaceholders !== undefined
        ? props.showMessagePlaceholders
        : getShowMessagePlaceholders(props.narrow)(state),
    theme: getSettings(state).theme,
    typingUsers: props.typingUsers || getCurrentTypingUsers(state, props.narrow),
  };
})(connectActionSheet(withGetText(MessageList)));
