/* @flow */
import React, { Component } from 'react';
import { WebView,View, Image } from 'react-native';

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

  sendMessages = (msg: WebviewInputMessage[]): void => {
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
    webViewHandleUpdates(this.props, nextProps, this.sendMessages);
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
    // console.logs('this renders');
    // console.logs(html); //Final HTML that is rendered

    // FAILED ATTEMPT to either embed cookies or authentication headers into document
    let cookie = `document.cookie= '_ga=GA1.2.956010057.1520612967; _gid=GA1.2.146282106.1522260427; sessionid=a6rzbsosvitskq7o7mrl5sl2v4wjmd8z; csrftoken=zu0jdLJS2XylUvxGIWcygCkE73fjOV1N4Yl2uQU2Ja3hjUSxHozzHqf7SSgLu99H'`; 
    let headers = `document.authorization= 'Basic aGFyc2h1bHNoYXJtYTAwMEBnbWFpbC5jb206MjU0ZGNnaFl1Y3MyTG1vM0JJcHdYbDg5TzF1RlVGeEQ='`;
    
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
