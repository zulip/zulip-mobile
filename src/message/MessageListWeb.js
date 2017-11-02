import React, { PureComponent } from 'react';
import { StyleSheet, WebView } from 'react-native';

import css from './html/css';
import js from './html/js';
import head from './html/head';
import renderMessagesAsHtml from './html/renderMessagesAsHtml';

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

  handleMessage = event => {
    const { actions } = this.props;
    const data = JSON.parse(event.nativeEvent.data);

    switch (data.type) {
      case 'scroll':
        if (data.y === 0) {
          actions.fetchOlder();
        }
        break;

      case 'avatar':
        actions.navigateToAccountDetails(data.fromEmail);
        break;

      case 'narrow':
        actions.doNarrow(JSON.parse(data.narrow.replace(/'/g, '"')));
        actions.navigateToAccountDetails(data.fromEmail);
        break;

      default:
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
