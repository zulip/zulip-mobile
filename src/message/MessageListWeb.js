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
import messageTagsAsHtml from './html/messageTagsAsHtml';

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
  updateMessages: [],
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

  sendNewContent = (anchor: number, content: string) => {
    if (content !== this.previousContent) {
      this.previousContent = content;
      this.sendMessage({
        type: 'content',
        anchor,
        content,
      });
    }
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

  scrollToEnd = () => {
    this.sendMessage({ type: 'bottom' });
  };

  componentWillReceiveProps = (nextProps: Props) => {
    const { actions, fetchingOlder, fetchingNewer } = this.props;
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
          // replace all
          // get new rendered messages
          const renderedMessages = renderMessages(action.messages, action.narrow);
          this.sendNewContent(
            action.anchor,
            this.content({ ...nextProps, renderedMessages, narrow: action.narrow }),
          );
        } else if (action.numBefore === 0) {
          // append at bottom
          // get new rendered messages
          const { renderedMessages } = this.props;
          const newRenderedMessages = renderMessages(
            action.messages.slice(1),
            nextProps.narrow,
            renderedMessages[renderedMessages.length - 1].data[
              renderedMessages[renderedMessages.length - 1].data.length - 1
            ].message,
          );
          this.sendMessage({
            type: 'bottom-messages',
            content: this.content({ ...nextProps, renderedMessages: newRenderedMessages }),
          });
        } else if (action.numAfter === 0) {
          // append at top
        } else {
          // replace all
          // initial fetch
          const renderedMessages = renderMessages(
            action.messages,
            action.narrow || nextProps.narrow,
          );
          const newContent = this.content({
            ...nextProps,
            renderedMessages,
            narrow: action.narrow || nextProps.narrow,
          });
          this.sendNewContent(action.anchor, newContent);
        }
      });
      actions.clearAllMessagesFromWebView();
    }

    if (nextProps.updateEditMessages.length > this.props.updateEditMessages.length) {
      nextProps.updateEditMessages.forEach(messagesAction => {
        const { action } = messagesAction;
        this.sendMessage({
          type: 'update-message',
          id: action.message_id,
          content: action.rendered_content,
        });
      });

      actions.clearAllUpdateMessagesFromWebView();
    }

    if (nextProps.updateMessageTags.length > this.props.updateMessageTags.length) {
      nextProps.updateMessageTags.forEach(messagesAction => {
        const { action } = messagesAction;
        this.sendMessage({
          type: 'update-message-tags',
          id: action.messageId,
          content: messageTagsAsHtml(action.timeEdited, action.isOutbox, action.isStarred),
        });
      });
      actions.clearAllUpdateMessagesTagsFromWebView();
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
  updateEditMessages: state.chat.webView.updateMessages,
  updateMessageTags: state.chat.webView.updateMessageTags,
}))(MessageListWeb);
