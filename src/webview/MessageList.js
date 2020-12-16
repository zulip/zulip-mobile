/* @flow strict-local */
import React, { Component } from 'react';
import { connectActionSheet } from '@expo/react-native-action-sheet';
import { WebView } from 'react-native-webview';
import { ZulipWebView } from '../common';

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
import htmlBody from './html/htmlBody';

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

class MessageList extends Component<Props> {
  static contextType = ThemeContext;
  context: ThemeData;

  webview: ?WebView = null;
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
    const html: string = getHtml(
      theme,
      {
        scrollMessageId: initialScrollMessageId,
        auth,
      },
      htmlBody(messagesHtml, showMessagePlaceholders),
    );

    return (
      <ZulipWebView
        html={html}
        onMessage={this.handleMessage}
        onError={this.handleError}
        ref={webview => {
          this.webview = webview;
        }}
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
