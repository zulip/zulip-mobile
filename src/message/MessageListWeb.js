import React, { PureComponent } from 'react';
import { StyleSheet, WebView } from 'react-native';

import css from './html/css';
import js from './html/js';
import renderMessagesAsHtml from './html/renderMessagesAsHtml';

const styles = StyleSheet.create({
  webview: {
    borderWidth: 0,
  },
});

export default class MessageListWeb extends PureComponent {
  handleMessage = event => {
    const { fetchOlder, navigateToAccountDetails } = this.props;
    const data = JSON.parse(event.nativeEvent.data);

    switch (data.type) {
      case 'scroll':
        if (data.y === 0) {
          fetchOlder();
        }
        break;
      case 'avatar':
        this.props.actions.pushRoute('account-details', data.fromEmail);
        break;
      case 'narrow':
        this.props.actions.doNarrow(JSON.parse(data.narrow.replace(/'/g, '"')));
        navigateToAccountDetails(data.fromEmail);
        break;
      default:
    }
  };

  render() {
    const { auth } = this.props;
    const messagesHtml = renderMessagesAsHtml(this.props);
    const html = messagesHtml.join('').replace(/src="\//g, `src="${auth.realm}/`);
    // console.log(css + html);
    return (
      <WebView
        source={{ html: css + html }}
        injectedJavaScript={js}
        style={styles.webview}
        decelerationRate={0.999}
        ref={webview => {
          this.webview = webview;
        }}
        onMessage={this.handleMessage}
      />
    );
  }
}
