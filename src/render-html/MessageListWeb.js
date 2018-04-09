/* @flow */
import React, { Component } from 'react';
import { WebView } from 'react-native';

import type { Props } from '../message/MessageListContainer';
import type { WebviewInputMessage } from './webViewHandleUpdates';
import { getAuthHeader } from '../utils/url';
import getHtml from '../render-html/html';
import renderMessagesAsHtml from '../render-html/renderMessagesAsHtml';
import webViewHandleUpdates from './webViewHandleUpdates';
import * as webViewEventHandlers from './webViewEventHandlers';

export default class MessageListWeb extends Component<Props> {
  webview: ?Object;
  props: Props;

  static contextTypes = {
    styles: () => null,
    theme: () => null,
  };

  handleError = (event: Object) => {
    console.error(event); // eslint-disable-line
  };

  sendMessage = (msg: WebviewInputMessage): void => {
    if (this.webview) {
      this.webview.postMessage(JSON.stringify(msg), '*');
    }
  };

  handleMessage = (event: Object) => {
    const eventData = JSON.parse(event.nativeEvent.data);
    const handler = `handle${eventData.type.charAt(0).toUpperCase()}${eventData.type.slice(1)}`;

    webViewEventHandlers[handler](this.props, eventData); // $FlowFixMe
  };

  shouldComponentUpdate = (nextProps: Props) => {
    webViewHandleUpdates(this.props, nextProps, this.sendMessage);
    return false;
  };

  render() {
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
          headers: {
            Authorization: getAuthHeader(auth.email, auth.apiKey),
          },
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
