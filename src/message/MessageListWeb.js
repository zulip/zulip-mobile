import React, { PureComponent } from 'react';
import { StyleSheet, WebView } from 'react-native';

import css from './html/css';
import js from './html/js';
import head from './html/head';
import { getResource } from '../utils/url';
import renderMessagesAsHtml from './html/renderMessagesAsHtml';
import { emojiReactionAdd, emojiReactionRemove } from '../api';

const styles = StyleSheet.create({
  webview: {
    borderWidth: 0,
  },
});

type Props = {
  actions: Actions,
};

export default class MessageListWeb extends PureComponent<Props> {
  props: Props;

  handleClick = ({ target, targetNodeName, targetClassName }) => {};

  handleScroll = ({ y }) => {
    const { actions } = this.props;
    if (y === 0) {
      actions.fetchOlder();
    }
  };

  handleAvatar = ({ fromEmail }) => {
    const { actions } = this.props;
    actions.navigateToAccountDetails(fromEmail);
  };

  handleNarrow = ({ narrow, fromEmail }) => {
    const { actions } = this.props;

    actions.doNarrow(JSON.parse(narrow.replace(/'/g, '"')));
    actions.navigateToAccountDetails(fromEmail);
  };

  handleImage = ({ src, messageId }) => {
    const { actions, auth, messages } = this.props;

    const message = messages.find(x => x.id === messageId);
    const resource = getResource(src, auth);

    actions.navigateToLightbox(resource, message);
  };

  handleMessage = event => {
    const data = JSON.parse(event.nativeEvent.data);
    const handler = `handle${data.type.charAt(0).toUpperCase()}${data.type.slice(1)}`;

    this[handler](data);
  };

  handleReaction = ({ messageId, name, voted }) => {
    const { auth } = this.props;

    if (voted) {
      emojiReactionRemove(auth, messageId, name);
    } else {
      emojiReactionAdd(auth, messageId, name);
    }
  };

  render() {
    const { auth } = this.props;
    const messagesHtml = renderMessagesAsHtml(this.props);
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
      />
    );
  }
}
