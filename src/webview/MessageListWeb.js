/* @flow */
import React, { Component } from 'react';
import { WebView } from 'react-native';

import type { Props } from '../message/MessageListContainer';
import type { WebviewInputMessage } from './webViewHandleUpdates';
import type { MessageListEvent } from './webViewEventHandlers';
import getHtml from './html/html';
import renderMessagesAsHtml from './html/renderMessagesAsHtml';
import { getInputMessages } from './webViewHandleUpdates';
import * as webViewEventHandlers from './webViewEventHandlers';

export default class MessageListWeb extends Component<Props> {
  webview: ?Object;
  props: Props;
  isReady: boolean = false;
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
      console.log('!!! SEND MESAGE', this.isReady, messages);
    }
  };

  handleMessage = (event: { nativeEvent: { data: string } }) => {
    const eventData: MessageListEvent = JSON.parse(event.nativeEvent.data);
    if (eventData.type === 'ready') {
      this.isReady = true;
      console.log('!!! READY EVENT');
      this.sendMessages(this.unsentMessages);
    } else {
      const handler = `handle${eventData.type.charAt(0).toUpperCase()}${eventData.type.slice(1)}`;
      console.log('!!! HANDLE EVENT', handler, this.props, eventData);
      webViewEventHandlers[handler](this.props, eventData); // $FlowFixMe
    }
  };

  shouldComponentUpdate = (nextProps: Props) => {
    const messages = getInputMessages(this.props, nextProps);

    if (this.isReady) {
      console.log('!!! SEND MESSAGES', messages);
      this.sendMessages(messages);
    } else {
      console.log('!!! QUEUE MESSAGES', messages);
      this.unsentMessages.push(...messages);
    }

    return false;
  };

  render() {
    console.log('!?!?! MessageListWeb.render');
    const { styles, theme } = this.context;
    const { anchor, auth, showMessagePlaceholders, debug } = this.props;
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
