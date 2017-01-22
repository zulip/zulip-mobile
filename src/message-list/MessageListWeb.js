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
    // console.log('MESSAGE INC', data);

    switch (data.type) {
      case 'scroll':
        if (data.y === 0) {
          this.props.fetchOlder();
        }
        break;
      case 'avatar':
        this.props.pushRoute('account-details', data.fromEmail);
        break;
      case 'narrow':
        this.props.doNarrow(JSON.parse(data.narrow.replace(/'/g, '"')));
        break;
      default:
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
      .replace(/src="\//g, `src="${auth.realm}/`);
    // console.log(css + html);
    return (
      <WebView
        source={{ html: css + html }}
        injectedJavaScript={js}
        style={styles.webview}
        decelerationRate={0.99}
        onMessage={this.handleMessage}
      />
    );
  }
}
