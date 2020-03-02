/* @flow strict-local */
import React, { Component } from 'react';
import { Platform, View } from 'react-native';
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
} from '../types';
import type { ThemeColors } from '../styles';
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
  typingUsers: $ReadOnlyArray<User>,
|};

// TODO get a type for `connectActionSheet` so this gets fully type-checked.
export type Props = $ReadOnly<{|
  narrow: Narrow,
  showMessagePlaceholders: boolean,

  dispatch: Dispatch,
  ...SelectorProps,

  // From `connectActionSheet`.
  showActionSheetWithOptions: ShowActionSheetWithOptions,

  // From `withGetText`.
  _: GetText,
|}>;

/**
 * A URL-like magic string denoting the webview-assets folder.
 *
 * Not suitable for reuse or export.
 */
const assetsPath = Platform.OS === 'ios' ? './webview' : 'file:///android_asset/webview';
// What the value above probably _should_ be, semantically, is an absolute
// `file:`-scheme URL pointing to the webview-assets folder. [1]
//
// * On Android, that's exactly what it is. Different apps' WebViews see
//   different (virtual) root directories as `file:///`, and in particular
//   the WebView provides the APK's `assets/` directory as
//   `file:///android_asset/`. [2]  We can easily hardcode that, so we do.
//
// * On iOS, it's not: it's a relative path. (Or relative URL, if you prefer.)
//   We can't make it absolute here, because neither React Native itself nor any
//   of our current dependencies directly expose the Foundation API that would
//   tell us the absolute path that our bundle is located at [3].
//
//   Instead, for now, we exploit the fact that (the iOS version of)
//   react-native-webview will have React Native resolve it with respect to
//   the bundle's absolute path. [4]  This fact is not known to be
//   documented, however, and should not be taken for granted indefinitely.
//
// [1] See `tools/build-webview` for more information on what folder that is.
//
// [2] Oddly, this essential feature doesn't seem to be documented!  It's
//     widely described in how-tos across the web and StackOverflow answers.
//     It's assumed in some related docs which mention it in passing, and
//     treated matter-of-factly in some Chromium bug threads.  Details at:
//     https://chat.zulip.org/#narrow/stream/243-mobile-team/topic/android.20filesystem/near/796440
//
// [3] Specifically, `Bundle.main.bundleURL` (aka `[[NSBundle mainbundle]
//     bundleURL]`).  Alternatively, `resourceURL` has a meaning similar to
//     the `assets/` directory in an Android app; for iOS app bundles, it
//     has the same value as `bundleURL`.
//     https://github.com/zulip/zulip-mobile/pull/3677#discussion_r344423032
//
// [4] https://github.com/react-native-community/react-native-webview/blob/v5.12.1/ios/RNCWKWebView.m#L376
//     https://github.com/facebook/react-native/blob/v0.59.10/React/Base/RCTConvert.m#L85

class MessageList extends Component<Props> {
  static contextType = ThemeContext;
  context: ThemeColors;

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
    clearInterval(this.readyRetryInterval);
    this.readyRetryInterval = setInterval(() => {
      if (!this.sendUpdateEventsIsReady) {
        this.sendUpdateEvents([{ type: 'ready' }]);
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

  renderLoading = () => {
    const style = {
      backgroundColor: 'transparent',
      width: '100%',
      height: '100%',
    };
    return <View style={style} />;
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
    const html = getHtml(messagesHtml, theme, {
      scrollMessageId: initialScrollMessageId,
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
          logging.warn('webview: rejected navigation event', {
            navigation_event: { ...event },
            expected_url: baseUrl,
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
        useWebKit
        startInLoadingState
        renderLoading={this.renderLoading}
        source={{ baseUrl, html }}
        originWhitelist={['file://']}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        /* eslint-disable react-native/no-inline-styles */
        style={{ backgroundColor: this.context.backgroundColor }}
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

  /* Passing these three from the parent is kind of a hack; search uses it
     to hard-code some behavior. */
  fetching?: Fetching,
  typingUsers?: User[],
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
