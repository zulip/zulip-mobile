/* @flow */
import React, { Component } from 'react';
import { WebView } from 'react-native';

import type { Actions, Auth, Narrow, TypingState, WebViewNavigationState } from '../types';
import getHtml from '../render-html/html';
import renderMessagesAsHtml from '../render-html/renderMessagesAsHtml';
import webViewHandleUpdates from './webViewHandleUpdates';
import * as webViewEventHandlers from './webViewEventHandlers';

type Props = {
  actions: Actions,
  auth: Auth,
  fetchingOlder: boolean,
  fetchingNewer: boolean,
  renderedMessages: Object[],
  anchor: number,
  narrow?: Narrow,
  typingUsers?: TypingState,
  listRef: (ref: Object) => void,
};

export default class MessageListWeb extends Component<Props> {
  webview: ?Object;
  props: Props;

  static contextTypes = {
    styles: () => null,
    theme: () => null,
  };

  handleMessage = (event: Object) => {
    const eventData = JSON.parse(event.nativeEvent.data);
    const handler = `handle${eventData.type.charAt(0).toUpperCase()}${eventData.type.slice(1)}`;

    // $FlowFixMe
    webViewEventHandlers[handler](this.props, eventData);
  };

  handleError = (event: Object) => {
    console.error(event); // eslint-disable-line
  };

  handleNavigationStateChange = (navigator: WebViewNavigationState) => {
    const { url } = navigator;
    if (!url.startsWith('data:')) {
      // $FlowFixMe
      this.webview.stopLoading();
      return false;
    }
    return true;
  };

  sendMessage = (msg: Object) => {
    if (this.webview) {
      console.log('sendMessage', msg);
      this.webview.postMessage(JSON.stringify(msg), '*');
    }
  };

  scrollToEnd = () => {
    this.sendMessage({ type: 'bottom' });
  };

  shouldComponentUpdate = () => false;

  componentWillReceiveProps = (nextProps: Props) => {
    webViewHandleUpdates(this.props, nextProps, this.sendMessage);
  };

  render() {
    const { styles, theme } = this.context;
    const { anchor, listRef, showMessagePlaceholders } = this.props;
    const html = getHtml(renderMessagesAsHtml(this.props), theme, showMessagePlaceholders);

    listRef({ scrollToEnd: this.scrollToEnd });

    // console.log(html);

    return (
      <WebView
        source={{ html }}
        anchor={anchor}
        injectedJavaScript={`scrollToAnchor(${anchor})`}
        style={styles.webview}
        ref={webview => {
          this.webview = webview;
        }}
        onMessage={this.handleMessage}
        onError={this.handleError}
        onNavigationStateChange={this.handleNavigationStateChange}
      />
    );
  }
}
