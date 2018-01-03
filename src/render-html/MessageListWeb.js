/* @flow */
import React, { Component } from 'react';
import { Text, View, WebView } from 'react-native';

import type { Actions, Auth, Narrow, TypingState, WebViewNavigationState } from '../types';
import html from '../render-html/html';
import MessageListLoading from '../message/MessageListLoading';
import renderMessagesAsHtml from '../render-html/renderMessagesAsHtml';
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

    // console.log(html(renderMessagesAsHtml(this.props), theme));

    return (
      <WebView
        source={{ html: html(renderMessagesAsHtml(this.props), theme) }}
        anchor={anchor}
        injectedJavaScript={`scrollToAnchor(${anchor})`}
        onNavigationStateChange={this.handleNavigationStateChange}
        style={styles.webview}
        ref={webview => {
          this.webview = webview;
        }}
        onMessage={this.handleMessage}
        onError={this.handleError}
        renderError={({ domain, code, description }) => (
          <View>
            <Text>{domain}</Text>
            <Text>{code}</Text>
            <Text>{description}</Text>
          </View>
        )}
        javaScriptEnabled
        renderLoading={MessageListLoading}
      />
    );
  }
}
