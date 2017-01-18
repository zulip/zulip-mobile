import React from 'react';
import { StyleSheet, WebView } from 'react-native';

import css from './html/css';
import js from './html/js';
import renderMessagesAsHtml from './html/renderMessagesAsHtml';

const styles = StyleSheet.create({
  webview: {
    borderWidth: 0,
  },
});

export default class MessageListWeb extends React.PureComponent {

  handleMessage = (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    console.log('MESSAGE INC', data);
    if (data.type === 'scroll' && data.y === 0) {
      this.props.fetchOlder();
    }
  };

  render() {
    const { auth, messages, subscriptions, isFetching, narrow } = this.props;
    const messagesHtml = renderMessagesAsHtml({
      auth,
      subscriptions,
      messages,
      isFetching,
      narrow,
    });
    const html = messagesHtml
      .join('')
      .replace('src="/', `src="${auth.realm}/`);

    return (
      <WebView
        source={{ html: css + html }}
        injectedJavaScript={js}
        style={styles.webview}
        onMessage={this.handleMessage}
      />
    );
  }
}
