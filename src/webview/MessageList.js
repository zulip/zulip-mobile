/* @flow strict-local */
import React, { Component } from 'react';
import { WebView } from 'react-native-webview';

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
  getSettings,
  getSubscriptions,
  getShowMessagePlaceholders,
  getShownMessagesForNarrow,
  getRealm,
} from '../selectors';
import { withGetText } from '../boot/TranslationProvider';

import type { ShowActionSheetWithOptions } from '../message/messageActionSheet';
import type { WebviewInputMessage } from './webViewHandleUpdates';
import type { MessageListEvent } from './webViewEventHandlers';
import getHtml from './html/html';
import renderMessagesAsHtml from './html/renderMessagesAsHtml';
import { getInputMessages } from './webViewHandleUpdates';
import { handleMessageListEvent } from './webViewEventHandlers';
import { base64Utf8Encode } from '../utils/encoding';

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

class MessageList extends Component<Props> {
  context: Context;
  webview: ?{ postMessage: (string, string) => void };
  sendMessagesIsReady: boolean;
  unsentMessages: WebviewInputMessage[] = [];

  static contextTypes = {
    styles: () => null,
    theme: () => null,
  };

  componentDidMount() {
    this.setupSendMessages();
  }

  handleError = (event: mixed) => {
    console.error(event); // eslint-disable-line
  };

  /**
   * Initiate round-trip handshakes with the WebView, until one succeeds.
   */
  setupSendMessages = (): void => {
    const intervalId = setInterval(() => {
      if (!this.sendMessagesIsReady) {
        this.sendMessages([{ type: 'ready' }]);
      } else {
        clearInterval(intervalId);
      }
    }, 30);
  };

  sendMessages = (messages: WebviewInputMessage[]): void => {
    if (this.webview && messages.length > 0) {
      this.webview.postMessage(base64Utf8Encode(JSON.stringify(messages)), '*');
    }
  };

  handleMessage = (event: { nativeEvent: { data: string } }) => {
    const eventData: MessageListEvent = JSON.parse(event.nativeEvent.data);
    if (eventData.type === 'ready') {
      this.sendMessagesIsReady = true;
      this.sendMessages(this.unsentMessages);
    } else {
      const { _ } = this.props;
      handleMessageListEvent(this.props, _, eventData);
    }
  };

  shouldComponentUpdate = (nextProps: Props) => {
    const messages = getInputMessages(this.props, nextProps);

    if (this.sendMessagesIsReady) {
      this.sendMessages(messages);
    } else {
      this.unsentMessages.push(...messages);
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
    const { auth, debug } = backgroundData;
    const html = getHtml(messagesHtml, theme, {
      anchor,
      auth,
      highlightUnreadMessages: debug.highlightUnreadMessages,
      showMessagePlaceholders,
    });

    return (
      <WebView
        useWebKit
        source={{
          baseUrl: auth.realm,
          html,
        }}
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
