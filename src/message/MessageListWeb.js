/* @flow */
import React, { PureComponent } from 'react';
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

export default class MessageListWeb extends PureComponent<Props> {
  webview: ?Object;
  props: Props;

  handleMessage = (event: Object) => {
    const eventData = JSON.parse(event.nativeEvent.data);
    const handler = `handle${eventData.type.charAt(0).toUpperCase()}${eventData.type.slice(1)}`;

    // $FlowFixMe
    webViewEventHandlers[handler](this.props, eventData);
  };

  render() {
    const { auth, singleFetchProgress, fetchingOlder, fetchingNewer } = this.props;
    const messagesHtml = [
      fetchingOlder ? '<div class="loading-spinner"></div>' : '',
      ...renderMessagesAsHtml(this.props),
      !singleFetchProgress && fetchingNewer ? '<div class="loading-spinner"></div>' : '',
    ];

    const html = messagesHtml.join('').replace(/src="\//g, `src="${auth.realm}/`);

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
