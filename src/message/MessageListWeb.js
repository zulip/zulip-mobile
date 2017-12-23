/* @flow */
import React, { Component } from 'react';
import { StyleSheet, WebView } from 'react-native';

import type { Actions, Auth, Narrow, TypingState } from '../types';
import css from './html/css';
import js from './html/js';
import html from './html/html';
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

  sendMessage = (msg: Object) => {
    if (this.webview) {
      this.webview.postMessage(JSON.stringify(msg), '*');
    }
  };

  shouldComponentUpdate = () => false;

  content = (props: Props) => {
    const { auth } = props;

    return renderMessagesAsHtml(props)
      .join('')
      .replace(/src="\//g, `src="${auth.realm}/`);
  };

  componentWillReceiveProps = (nextProps: Props) => {
    const { anchor, fetchingOlder, fetchingNewer } = this.props;
    if (fetchingOlder !== nextProps.fetchingOlder || fetchingNewer !== nextProps.fetchingNewer) {
      this.sendMessage({
        type: 'fetching',
        fetchingOlder: nextProps.fetchingOlder,
        fetchingNewer: nextProps.fetchingNewer,
      });
    } else {
      this.sendMessage({
        type: 'content',
        anchor,
        content: this.content(nextProps),
      });
    }
  };

  render() {
    const { anchor } = this.props;
    console.log(css + html(this.content()) + js);
    return (
      <WebView
        source={{ html: css + html(this.content(this.props)) + js }}
        anchor={anchor}
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
