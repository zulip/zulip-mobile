/* @flow */
import React, { Component } from 'react';
import { WebView } from 'react-native';

import type { Context } from '../types';
import type { ChildProps as MessageListProps } from '../message/MessageList';
import type { WebviewInputMessage } from './webViewHandleUpdates';
import type { MessageListEvent } from './webViewEventHandlers';
import getHtml from './html/html';
import renderMessagesAsHtml from './html/renderMessagesAsHtml';
import { getInputMessages } from './webViewHandleUpdates';
import { handleMessageListEvent } from './webViewEventHandlers';
import { base64Utf8Encode } from '../utils/encoding';

export type Props = MessageListProps & {
  onLongPress: (messageId: number, target: string) => void,
};

export default class MessageListWeb extends Component<Props> {
  context: Context;
  props: Props;
  webview: ?Object;
  sendMessagesIsReady: boolean;
  unsentMessages: WebviewInputMessage[] = [];

  static contextTypes = {
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
      handleMessageListEvent(this.props, eventData);
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
