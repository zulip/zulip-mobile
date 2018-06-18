/* @flow */
import React, { Component } from 'react';
import { WebView } from 'react-native';

import type { Context } from '../types';
import type { Props } from '../message/MessageList';
import type { WebviewInputMessage } from './webViewHandleUpdates';
import type { MessageListEvent } from './webViewEventHandlers';
import getHtml from './html/html';
import renderMessagesAsHtml from './html/renderMessagesAsHtml';
import { getInputMessages } from './webViewHandleUpdates';
import * as webViewEventHandlers from './webViewEventHandlers';
import { baseUrl } from './webviewHelpers';

export default class MessageListWeb extends Component<Props> {
  context: Context;
  props: Props;
  webview: ?Object;
  isReady: boolean;
  unsentMessages: WebviewInputMessage[] = [];

  static contextTypes = {
    styles: () => null,
    theme: () => null,
  };

  handleError = (event: Object) => {
    console.error(event); // eslint-disable-line
  };

  sendMessages = (messages: WebviewInputMessage[]): void => {
    if (this.webview && messages.length > 0) {
      this.webview.postMessage(JSON.stringify(messages), '*');
    }
  };

  handleMessage = (event: { nativeEvent: { data: string } }) => {
    const eventData: MessageListEvent = JSON.parse(event.nativeEvent.data);
    if (eventData.type === 'ready') {
      this.isReady = true;
      this.sendMessages(this.unsentMessages);
    } else {
      const handler = `handle${eventData.type.charAt(0).toUpperCase()}${eventData.type.slice(1)}`;
      webViewEventHandlers[handler](this.props, eventData);
    }
  };

  shouldComponentUpdate = (nextProps: Props) => {
    const messages = getInputMessages(this.props, nextProps);

    if (this.isReady) {
      this.sendMessages(messages);
    } else {
      this.unsentMessages.push(...messages);
    }

    return false;
  };

  render() {
    const { styles, theme } = this.context;
    const { anchor, showMessagePlaceholders, debug } = this.props;
    const html = getHtml(renderMessagesAsHtml(this.props), theme, {
      anchor,
      highlightUnreadMessages: debug.highlightUnreadMessages,
      showMessagePlaceholders,
    });

    // For debugging issues in our HTML and CSS: Uncomment this line,
    // copy-paste the output to a file, and open in a browser.
    // console.log(html);

    return (
      <WebView
        source={{
          baseUrl,
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
