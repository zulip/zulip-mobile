/* @flow */
import React, { Component } from 'react';
import { StyleSheet, WebView } from 'react-native';

import type { Actions, Auth, Narrow, TypingState } from '../types';
import css from './html/css';
import js from './html/js';
import html from './html/html';
import renderMessagesAsHtml from './html/renderMessagesAsHtml';
import * as webViewEventHandlers from './webViewEventHandlers';
import connectWithActions from '../connectWithActions';
import renderMessages from './renderMessages';

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
  anchor: number,
  narrow?: Narrow,
  typingUsers?: TypingState,
  listRef: (ref: Object) => void,
};

class MessageListWeb extends Component<Props> {
  webview: ?Object;
  props: Props;
  previousContent: string;

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

    const temp = renderMessagesAsHtml(props)
      .join('')
      .replace(/src="\//g, `src="${auth.realm}/`);
    return temp;
  };

  scrollToEnd = () => {
    this.sendMessage({ type: 'bottom' });
  };

  componentWillReceiveProps = (nextProps: Props) => {
    const { actions, anchor, fetchingOlder, fetchingNewer, renderedMessages } = this.props;

    if (fetchingOlder !== nextProps.fetchingOlder || fetchingNewer !== nextProps.fetchingNewer) {
      this.sendMessage({
        type: 'fetching',
        fetchingOlder: nextProps.fetchingOlder,
        fetchingNewer: nextProps.fetchingNewer,
      });
    }

    if (nextProps.updateMessages.length > this.props.updateMessages.length) {
      // new messages are fetched & needs to be appended in the list
      nextProps.updateMessages.forEach(messagesAction => {
        const { action } = messagesAction;
        // find where to append
        if (action.numAfter === -1 && action.numBefore === -1) {
          console.log('Replace all');
          // replace all
          // get new rendered messages
          const renderedMessages = renderMessages(action.messages, action.narrow);
          console.log(renderedMessages);
          this.sendMessage({
            type: 'content',
            anchor: action.anchor,
            content: this.content({ ...nextProps, renderedMessages, narrow: action.narrow }),
          });
        } else if (action.numBefore === 0) {
          // append at bottom
          // get new rendered messages
          const renderedMessages = renderMessages(
            action.messages.slice(1),
            nextProps.narrow,
            this.props.renderedMessages[this.props.renderedMessages.length - 1].data[
              this.props.renderedMessages[this.props.renderedMessages.length - 1].data.length - 1
            ].message,
          );
          this.sendMessage({
            type: 'bottom-messages',
            content: this.content({ ...nextProps, renderedMessages }),
          });
        } else if (action.numAfter === 0) {
          // append at top
        } else {
          console.log('initial fetch Replace all');
          // replace all
          // initial fetch
          this.sendMessage({
            type: 'content',
            anchor,
            content: this.content(nextProps),
          });
        }
      });
      actions.clearAllMessagesFromWebView();
    }
  };

  render() {
    const { anchor, listRef } = this.props;

    listRef({ scrollToEnd: this.scrollToEnd });
    // console.log(css + html(this.content(this.props)) + js);
    return (
      <WebView
        source={{ html: css + html(this.content(this.props)) + js }}
        anchor={anchor}
        injectedJavaScript={`scrollToAnchor(${anchor})`}
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

export default connectWithActions(state => ({
  updateMessages: state.chat.webView.messages,
}))(MessageListWeb);
