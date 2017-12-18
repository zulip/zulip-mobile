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
    if (nextProps.fetchingOlder !== this.props.fetchingOlder) {
      // toggle top loading-spinner
      this.webview.postMessage(
        JSON.stringify({
          type: 'loading-top',
          newState: nextProps.fetchingOlder,
        }),
        '*',
      );
    }
    if (nextProps.fetchingNewer !== this.props.fetchingNewer) {
      this.webview.postMessage(
        JSON.stringify({
          type: 'loading-bottom',
          newState: nextProps.fetchingNewer,
        }),
        '*',
      );
    }
    // find newly fetched message
    if (nextProps.messages.length > this.props.messages.length) {
      if (nextProps.messages[0].timestamp === this.props.messages[0].timestamp) {
        // newly messages are at bottom
        this.webview.postMessage(
          JSON.stringify({
            type: 'message-below',
            html: this.getHtml({
              ...nextProps,
              messages: nextProps.messages.slice(
                this.props.messages.length,
                nextProps.messages.length,
              ),
            }),
          }),
          '*',
        );
      } else if (
        nextProps.messages[nextProps.messages.length - 1].timestamp ===
        this.props.messages[this.props.messages.length - 1].timestamp
      ) {
        // newly messages are at top
        this.webview.postMessage(
          JSON.stringify({
            type: 'message-top',
            html: this.getHtml({
              ...nextProps,
              messages: nextProps.messages.slice(0, nextProps.messages.length),
            }),
          }),
          '*',
        );
      } else {
        // replace all
        this.webview.postMessage(
          JSON.stringify({
            type: 'message-replace',
            html: this.getHtml(nextProps),
          }),
          '*',
        );
      }
    } else if (
      !(
        nextProps.messages.length === this.props.messages.length &&
        nextProps.messages[0].id === this.props.messages[0].id &&
        nextProps.messages[nextProps.messages.length - 1].id ===
          this.props.messages[this.props.messages.length - 1].id
      )
    ) {
      // if all messages are same
      // narrow are changed
      // replace all messages
      this.webview.postMessage(
        JSON.stringify({
          type: 'message-replace',
          html: this.getHtml(nextProps),
        }),
        '*',
      );
    }

    return false;
  }

  render() {
    const { fetchingOlder, fetchingNewer, singleFetchProgress } = this.props;
    const html = `<div id="top_loader" class="${
      fetchingOlder ? 'loading-spinner' : ''
    }"></div>${this.getHtml(this.props)}<div id="bottom_loader" class="${
      !singleFetchProgress && fetchingNewer ? 'loading-spinner' : ''
    }"></div>`;

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
