/* @flow strict-local */
import React, { Component } from 'react';
import { Platform, NativeModules } from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewNavigation } from 'react-native-webview';
import { connectActionSheet } from '@expo/react-native-action-sheet';

import type {
  AlertWordsState,
  Auth,
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
  UserOrBot,
  EditMessage,
} from '../types';
import type { ThemeData } from '../styles';
import { ThemeContext } from '../styles';
import { connect } from '../react-redux';
import {
  getAuth,
  getAllImageEmojiById,
  getCurrentTypingUsers,
  getDebug,
  getRenderedMessages,
  getFlags,
  getFetchingForNarrow,
  getFirstUnreadIdInNarrow,
  getMute,
  getOwnUser,
  getSettings,
  getSubscriptions,
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
import { tryParseUrl } from '../utils/url';

// ESLint doesn't notice how `this.props` escapes, and complains about some
// props not being used here.
/* eslint-disable react/no-unused-prop-types */

/**
 * Data about the user, the realm, and all known messages.
 *
 * This data is all independent of the specific narrow or specific messages
 * we're displaying; data about those goes elsewhere.
 *
 * We pass this object down to a variety of lower layers and helper
 * functions, where it saves us from individually wiring through all the
 * overlapping subsets of this data they respectively need.
 */
export type BackgroundData = $ReadOnly<{|
  alertWords: AlertWordsState,
  allImageEmojiById: $ReadOnly<{ [id: string]: ImageEmojiType }>,
  auth: Auth,
  debug: Debug,
  flags: FlagsState,
  mute: MuteState,
  ownUser: User,
  subscriptions: Subscription[],
  theme: ThemeName,
  twentyFourHourTime: boolean,
|}>;

type SelectorProps = {|
  // Data independent of the particular narrow or messages we're displaying.
  backgroundData: BackgroundData,

  // The remaining props contain data specific to the particular narrow or
  // particular messages we're displaying.  Data that's independent of those
  // should go in `BackgroundData`, above.
  initialScrollMessageId: number | null,
  fetching: Fetching,
  messages: $ReadOnlyArray<Message | Outbox>,
  renderedMessages: RenderedSectionDescriptor[],
  typingUsers: $ReadOnlyArray<UserOrBot>,
|};

// TODO get a type for `connectActionSheet` so this gets fully type-checked.
export type Props = $ReadOnly<{|
  narrow: Narrow,
  showMessagePlaceholders: boolean,
  startEditMessage: (editMessage: EditMessage) => void,

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
 * - On iOS: We can't easily hardcode this because it includes UUIDs.
 *   So we bring it over the React Native bridge in ZLPConstants.m.
 *
 * - On Android: Different apps' WebViews see different (virtual) root
 *   directories as `file:///`, and in particular the WebView provides
 *   the APK's `assets/` directory as `file:///android_asset/`. [1]
 *   We can easily hardcode that, so we do.
 *
 * [1] Oddly, this essential feature doesn't seem to be documented!  It's
 *     widely described in how-tos across the web and StackOverflow answers.
 *     It's assumed in some related docs which mention it in passing, and
 *     treated matter-of-factly in some Chromium bug threads.  Details at:
 *     https://chat.zulip.org/#narrow/stream/243-mobile-team/topic/android.20filesystem/near/796440
 */
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

class MessageList extends Component<Props> {
  static contextType = ThemeContext;
  context: ThemeData;

  webview: ?WebView;
  readyRetryInterval: IntervalID | void;
  sendUpdateEventsIsReady: boolean;
  unsentUpdateEvents: WebViewUpdateEvent[] = [];

  componentDidMount() {
    this.setupSendUpdateEvents();
  }

  componentWillUnmount() {
    clearInterval(this.readyRetryInterval);
    this.readyRetryInterval = undefined;
  }

  handleError = (event: mixed) => {
    console.error(event); // eslint-disable-line
  };

  /**
   * Initiate round-trip handshakes with the WebView, until one succeeds.
   */
  setupSendUpdateEvents = (): void => {
    const timeAtSetup = Date.now();
    let attempts: number = 0;
    let hasLogged: boolean = false;

    clearInterval(this.readyRetryInterval);
    this.readyRetryInterval = setInterval(() => {
      const timeElapsedMs: number = Date.now() - timeAtSetup;
      if (timeElapsedMs > 1000 && hasLogged === false) {
        logging.warn('Possible infinite loop in WebView "ready" setup', {
          attempts,
          timeElapsedMs,
        });
        hasLogged = true;
      }

      if (!this.sendUpdateEventsIsReady) {
        this.sendUpdateEvents([{ type: 'ready' }]);
        attempts++;
      } else {
        clearInterval(this.readyRetryInterval);
        this.readyRetryInterval = undefined;
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
    const {
      backgroundData,
      renderedMessages,
      initialScrollMessageId,
      narrow,
      showMessagePlaceholders,
    } = this.props;
    const messagesHtml = renderMessagesAsHtml(backgroundData, narrow, renderedMessages);
    const { auth, theme } = backgroundData;
    const html: string = getHtml(messagesHtml, theme, {
      scrollMessageId: initialScrollMessageId,
      auth,
      showMessagePlaceholders,
    });

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
        return (url: string) => {
          const parsedUrl = tryParseUrl(url);
          if (!loaded_once && parsedUrl && parsedUrl.toString() === baseUrl.toString()) {
            loaded_once = true;
            return true;
          }
          return false;
        };
      })();

      // Outer closure to perform logging.
      return (event: WebViewNavigation) => {
        const ok = urlTester(event.url);
        if (!ok) {
          logging.warn('webview: rejected navigation event', {
            navigation_event: { ...event },
            expected_url: baseUrl.toString(),
          });
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
        source={{ baseUrl: (baseUrl.toString(): string), html }}
        originWhitelist={['file://']}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        style={{ backgroundColor: 'transparent' }}
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
  showMessagePlaceholders: boolean,

  /* Remaining props are derived from `narrow` by default. */

  messages?: Message[],
  renderedMessages?: RenderedSectionDescriptor[],
  initialScrollMessageId?: number | null,

  /* Passing these two from the parent is kind of a hack; search uses it
     to hard-code some behavior. */
  fetching?: Fetching,
  typingUsers?: UserOrBot[],
|};

export default connect<SelectorProps, _, _>((state, props: OuterProps) => {
  // TODO Ideally this ought to be a caching selector that doesn't change
  // when the inputs don't.  Doesn't matter in a practical way here, because
  // we have a `shouldComponentUpdate` that doesn't look at this prop... but
  // it'd be better to set an example of the right general pattern.
  const backgroundData: BackgroundData = {
    alertWords: state.alertWords,
    allImageEmojiById: getAllImageEmojiById(state),
    auth: getAuth(state),
    debug: getDebug(state),
    flags: getFlags(state),
    mute: getMute(state),
    ownUser: getOwnUser(state),
    subscriptions: getSubscriptions(state),
    theme: getSettings(state).theme,
    twentyFourHourTime: getRealm(state).twentyFourHourTime,
  };

  return {
    backgroundData,
    initialScrollMessageId:
      props.initialScrollMessageId !== undefined
        ? props.initialScrollMessageId
        : getFirstUnreadIdInNarrow(state, props.narrow),
    fetching: props.fetching || getFetchingForNarrow(state, props.narrow),
    messages: props.messages || getShownMessagesForNarrow(state, props.narrow),
    renderedMessages: props.renderedMessages || getRenderedMessages(state, props.narrow),
    typingUsers: props.typingUsers || getCurrentTypingUsers(state, props.narrow),
  };
})(connectActionSheet(withGetText(MessageList)));
