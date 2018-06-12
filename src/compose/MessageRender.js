/* @flow */
import React, { PureComponent } from 'react';
import { View, StyleSheet, WebView } from 'react-native';
import parseMarkdown from 'zulip-markdown-parser';

import { getAuth } from '../account/accountSelectors';
import { BORDER_COLOR } from '../styles';
import connectWithActions from '../connectWithActions';
import type { Subscription, Auth, User } from '../types';
import { getUsers, getTopMostNarrow } from '../selectors';
import { Label } from '../common';
import css from '../webview/css/css';

const inlineStyles = StyleSheet.create({
  preview: {
    padding: 5,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    flex: 1,
  },
});

type Props = {
  message: string,
  realm_emoji: Object,
  realm_filter: [],
  streams: Subscription[],
  auth: Auth,
  users: User[],
};

class MessageRender extends PureComponent<Props> {
  props: Props;

  static contextTypes = {
    styles: () => null,
    theme: () => null,
  };

  handleError = (event: Object) => {
    console.error(event); // eslint-disable-line
  };
  render() {
    const { users, streams, auth, realm_emoji, realm_filter, message } = this.props;
    if (message === '') {
      return <Label text="Write a message to show a showPreview" />;
    }
    const { styles, theme } = this.context;
    const messageHtml = parseMarkdown(message, users, streams, auth, realm_filter, realm_emoji);
    const html = `
      ${css(theme, false)}
      <body>
      ${messageHtml}
      </body>
    `;
    return (
      <View style={inlineStyles.preview}>
        <WebView
          source={{
            html,
          }}
          style={[styles.webview]}
          scalesPageToFit={false}
        />
      </View>
    );
  }
}

export default connectWithActions(state => ({
  auth: getAuth(state),
  users: getUsers(state),
  narrow: getTopMostNarrow(state),
  streams: state.subscriptions,
  realm_emoji: state.realm.emoji,
  realm_filter: state.realm.filters,
}))(MessageRender);
