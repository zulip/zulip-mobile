/* @flow */
import React, { Component } from 'react';
import { StyleSheet, WebView } from 'react-native';

import type { Actions, Auth, Narrow, TypingState } from '../types';
import css from './html/css';
import js from './html/js';
import head from './html/head';
import renderMessagesAsHtml from './html/renderMessagesAsHtml';
import * as webViewEventHandlers from './webViewEventHandlers';

const styles = StyleSheet.create({
  webview: {
    borderWidth: 0,
  },
});

type Props = {
  actions: Actions,
  auth: Auth,
  fetchingOlder: boolean,
  fetchingNewer: boolean,
  singleFetchProgress?: boolean,
  renderedMessages: Object[],
  anchor?: number,
  narrow?: Narrow,
  typingUsers?: TypingState,
};

export default class MessageListWeb extends Component<Props> {
  webview: ?Object;
  props: Props;

  handleMessage = (event: Object) => {
    const eventData = JSON.parse(event.nativeEvent.data);
    const handler = `handle${eventData.type.charAt(0).toUpperCase()}${eventData.type.slice(1)}`;

    // $FlowFixMe
    webViewEventHandlers[handler](this.props, eventData);
  };

  getHtml = props => {
    const { auth } = props;

    const messageAsHtml = renderMessagesAsHtml(props);
    return messageAsHtml.join('').replace(/src="\//g, `src="${auth.realm}/`);
  };

  shouldComponentUpdate(nextProps, nextState) {
    this.webview.postMessage(
      JSON.stringify({
        type: 'aboveMessages',
        html: this.getHtml(nextProps),
      }),
      '*',
    );

    return false;
  }

  render() {
    const html = `<div class="loading-spinner"></div>${this.getHtml(
      this.props,
    )}<div class="loading-spinner"></div>`;

    return (
      <WebView
        source={{ html: head + css + html }}
        injectedJavaScript={js}
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
