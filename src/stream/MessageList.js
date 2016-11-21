import React from 'react';
import {
  StyleSheet,
  WebView,
} from 'react-native';

const styles = StyleSheet.create({
  webview: {
    borderWidth: 0,
  },
});

export default class MessageList extends React.PureComponent {
  render() {
    console.log('MESSAGES', this.props.messages.toJS());
    const { messages } = this.props;
    const css = `
<style>
  a {
    color: #08c;
    text-decoration: none;
  }
  blockquote {
    padding-left: 5px;
    margin-left: 10px;
    border-left-color: #ddd;
  }
  code {
    font-size: .857em;
    color: black;
    background-color: #f7f7f9;
    border-radius: 3px;
    border: 1px solid #e1e1e8;
    white-space: pre-wrap;
    padding: 0 4px;
    font-family: Monaco, Menlo, Consolas, "Courier New", monospace;
  }
  .message {
    display: flex;
    font-family: sans-serif;
    word-wrap: break-word;
  }
  .avatar {
    border-radius: 100px;
    overflow: hidden;
    margin-right: 10px;
  }
  .avatar, .avatar .img {
    width: 35px;
    height: 35px;
  }
  .content {
    flex: 1;
    background: 'red';
  }
  .sender_name {
    font-weight: bold;
  }
  .user-mention {
    background-color: #eee;
    border-radius: 3px;
    padding: 0 .2em;
    box-shadow: 0 0 0 1px #ccc;
  }
</style>
`;
    const messagesHtml = messages.toJS().map(x => `
<div class="message">
  <div class="avatar">
    <img src="${x.avatar_url}">
  </div>
  <div>
    <div class="sender_name">
      ${x.sender_full_name}
    </div>
    <div class="content">
      ${x.content}
    </div>
  </div>
</div>
`);
    const html = css + messagesHtml.join('\n');
    return (
      <WebView source={{ html }} bounces={false} style={styles.webview} />
    );
  }
}
