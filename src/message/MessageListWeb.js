/* @flow */
import React, { Component } from 'react';
import { WebView } from 'react-native';

import type { Actions, Auth, Narrow, TypingState, WebViewNavigationState } from '../types';
import css from './html/css';
import js from './html/js';
import html from './html/html';
import renderMessagesAsHtml from './html/renderMessagesAsHtml';
import webViewHandleUpdates from './webViewHandleUpdates';
import * as webViewEventHandlers from './webViewEventHandlers';

type Props = {
  actions: Actions,
  auth: Auth,
  fetchingOlder: boolean,
  fetchingNewer: boolean,
  singleFetchProgress?: boolean,
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
    const { anchor, listRef } = this.props;

    listRef({ scrollToEnd: this.scrollToEnd });
    // console.log(css(theme) + html(renderMessagesAsHtml(this.props)) + js);
    return (
      <WebView
        source={{ html: css(theme) + html(renderMessagesAsHtml(this.props)) + js }}
        anchor={anchor}
        injectedJavaScript={`scrollToAnchor(${anchor})`}
        onNavigationStateChange={this.handleNavigationStateChange}
        style={styles.webview}
        ref={webview => {
          this.webview = webview;
        }}
        onMessage={this.handleMessage}
        javaScriptEnabled
      />
    );
  }
}
