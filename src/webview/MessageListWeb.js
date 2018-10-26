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
import { base64Utf8Encode } from '../utils/encoding';

export default class MessageListWeb extends Component<Props> {
  context: Context;
  props: Props;
  isWebViewReady: boolean;
  webview: ?Object;
  unsentMessages: WebviewInputMessage[] = [];

  static contextTypes = {
    styles: () => null,
    theme: () => null,
  };

  componentDidMount() {
    /*
     * Initiates a two-way handshake with the WebView. Ensures that both sides are
     * ready to communicate before considering to be ready.
     *
     * This component communicates with webView with the help of `postMessage`.
     * It needs to be ensured that this communication channel is established successfully
     * on both side, else it will cause issue like #3080.
     * Two way hand shake mechanism is used for this purpose.
     *
     * Send a hello event till a confirmation is reveived from webView.
     */
    const intervalId = setInterval(() => {
      if (!this.isWebViewReady) {
        this.sendMessages([{ type: 'ready' }]);
      } else {
        clearInterval(intervalId);
      }
    }, 30);
  }

  handleError = (event: Object) => {
    console.error(event); // eslint-disable-line
  };

  sendMessages = (messages: WebviewInputMessage[]): void => {
    if (this.webview && messages.length > 0) {
      this.webview.postMessage(base64Utf8Encode(JSON.stringify(messages)), '*');
    }
  };

  handleMessage = (event: { nativeEvent: { data: string } }) => {
    const eventData: MessageListEvent = JSON.parse(event.nativeEvent.data);
    if (eventData.type === 'ready') {
      this.isWebViewReady = true;
      this.sendMessages(this.unsentMessages);
    } else {
      const handler = `handle${eventData.type.charAt(0).toUpperCase()}${eventData.type.slice(1)}`;
      webViewEventHandlers[handler](this.props, eventData);
    }
  };

  shouldComponentUpdate = (nextProps: Props) => {
    const messages = getInputMessages(this.props, nextProps);

    if (this.isWebViewReady) {
      this.sendMessages(messages);
    } else {
      this.unsentMessages.push(...messages);
    }

    return false;
  };

  render() {
    const { styles, theme } = this.context;
    const { anchor, auth, showMessagePlaceholders, debug } = this.props;
    const html = getHtml(renderMessagesAsHtml(this.props), theme, {
      anchor,
      auth,
      highlightUnreadMessages: debug.highlightUnreadMessages,
      showMessagePlaceholders,
    });

    // For debugging issues in our HTML and CSS: Uncomment this line,
    // copy-paste the output to a file, and open in a browser.
    // console.log(html);

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
