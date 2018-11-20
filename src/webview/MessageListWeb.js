/* @flow */
import React, { Component } from 'react';
import { WebView } from 'react-native';
import { connect } from 'react-redux';

import { connectActionSheet } from '@expo/react-native-action-sheet';

import type {
  Auth,
  Context,
  Debug,
  Dispatch,
  Fetching,
  FlagsState,
  GlobalState,
  Message,
  MuteState,
  Narrow,
  RenderedSectionDescriptor,
  Subscription,
  User,
} from '../types';
import {
  getAuth,
  getAllRealmEmojiById,
  getCurrentTypingUsers,
  getDebug,
  getRenderedMessages,
  getFlags,
  getAnchorForActiveNarrow,
  getFetchingForActiveNarrow,
  getMute,
  getOwnEmail,
  getSubscriptions,
  getShowMessagePlaceholders,
  getShownMessagesForNarrow,
  getRealm,
} from '../selectors';

import type { WebviewInputMessage } from './webViewHandleUpdates';
import type { MessageListEvent } from './webViewEventHandlers';
import type { RenderContext } from './html/messageAsHtml';
import getHtml from './html/html';
import renderMessagesAsHtml from './html/renderMessagesAsHtml';
import { getInputMessages } from './webViewHandleUpdates';
import { handleMessageListEvent } from './webViewEventHandlers';
import { base64Utf8Encode } from '../utils/encoding';

// ESLint doesn't notice how `this.props` escapes, and complains about some
// props not being used here.
/* eslint-disable react/no-unused-prop-types */

// TODO get a type for `connectActionSheet` so this gets fully type-checked.
export type Props = {
  anchor: number,
  auth: Auth,
  debug: Debug,
  dispatch: Dispatch,
  fetching: Fetching,
  flags: FlagsState, // also in RenderContext
  messages: Message[],
  mute: MuteState,
  narrow: Narrow, // also in RenderContext
  renderContext: RenderContext,
  renderedMessages: RenderedSectionDescriptor[],
  showMessagePlaceholders: boolean,
  subscriptions: Subscription[], // also in RenderContext
  typingUsers: User[],

  // From `connectActionSheet`.
  showActionSheetWithOptions: (Object, (number) => void) => void,
};

class MessageListWeb extends Component<Props> {
  context: Context;
  props: Props;
  webview: ?Object;
  sendMessagesIsReady: boolean;
  unsentMessages: WebviewInputMessage[] = [];

  static contextTypes = {
    intl: () => null,
    styles: () => null,
    theme: () => null,
  };

  componentDidMount() {
    this.setupSendMessages();
  }

  handleError = (event: Object) => {
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
      const getString = value => this.context.intl.formatMessage({ id: value });
      handleMessageListEvent(this.props, getString, eventData);
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
    const { styles, theme } = this.context;
    const {
      renderContext,
      renderedMessages,
      anchor,
      auth,
      showMessagePlaceholders,
      debug,
    } = this.props;
    const messagesHtml = renderMessagesAsHtml(renderContext, renderedMessages);
    const html = getHtml(messagesHtml, theme, {
      anchor,
      auth,
      highlightUnreadMessages: debug.highlightUnreadMessages,
      showMessagePlaceholders,
    });

    return (
      <WebView
        source={{
          baseUrl: auth.realm,
          html,
        }}
        style={styles.webview}
        ref={webview => {
          this.webview = webview;
        }}
        onMessage={this.handleMessage}
        onError={this.handleError}
      />
    );
  }
}

type OuterProps = {
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
};

export default connect((state: GlobalState, props: OuterProps) => {
  // TODO Ideally this ought to be a caching selector that doesn't change
  // when the inputs don't.  Doesn't matter in a practical way here, because
  // we have a `shouldComponentUpdate` that doesn't look at this prop... but
  // it'd be better to set an example of the right general pattern.
  const renderContext: RenderContext = {
    narrow: props.narrow,
    alertWords: state.alertWords,
    flags: getFlags(state), // also a prop, see below
    ownEmail: getOwnEmail(state),
    realmEmoji: getAllRealmEmojiById(state),
    subscriptions: getSubscriptions(state), // also a prop, see below
    twentyFourHourTime: getRealm(state).twentyFourHourTime,
  };

  return {
    renderContext,
    anchor: props.anchor || getAnchorForActiveNarrow(props.narrow)(state),
    auth: getAuth(state),
    debug: getDebug(state),
    fetching: props.fetching || getFetchingForActiveNarrow(props.narrow)(state),
    flags: getFlags(state),
    messages: props.messages || getShownMessagesForNarrow(props.narrow)(state),
    mute: getMute(state),
    renderedMessages: props.renderedMessages || getRenderedMessages(props.narrow)(state),
    showMessagePlaceholders:
      props.showMessagePlaceholders || getShowMessagePlaceholders(props.narrow)(state),
    subscriptions: getSubscriptions(state),
    typingUsers: props.typingUsers || getCurrentTypingUsers(props.narrow)(state),
  };
})(connectActionSheet(MessageListWeb));
