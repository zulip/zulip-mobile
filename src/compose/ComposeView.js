import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
} from 'react-native';

import { BORDER_COLOR, COMPOSE_VIEW_HEIGHT } from '../common/styles';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    backgroundColor: '#fff',
  },
  threadBox: {
    flex: 1,
    flexDirection: 'row',
    height: COMPOSE_VIEW_HEIGHT,
  },
  messageBox: {
    flex: 1,
    flexDirection: 'row',
    height: COMPOSE_VIEW_HEIGHT,
  },
  threadInput: {
    flex: 1,
    padding: 8,
    fontSize: 16,
    backgroundColor: '#eee',
  },
  streamInput: {
    flex: 1,
    padding: 8,
    fontSize: 16,
    backgroundColor: '#ccc',
  },
  composeInput: {
    flex: 1,
    padding: 8,
    fontSize: 16,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    backgroundColor: '#eef',
    padding: 8,
  },
  sendButtonText: {
    flex: 1,
    textAlign: 'center',
  },
});

export default class ComposeView extends React.Component {

  state = {
    editing: false,
  };

  renderSendButton() {
    return (
      <View style={styles.sendButton}>
        <Text style={styles.sendButtonText}>Send</Text>
      </View>
    );
  }

  renderThreadBox() {
    return (
      <View style={styles.threadBox}>
        <TextInput
          style={styles.streamInput}
          placeholder="stream"
        />
        <TextInput
          style={styles.threadInput}
          placeholder="topic"
        />
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        {this.state.editing ? this.renderThreadBox() : <View />}
        <View style={styles.messageBox}>
          <TextInput
            style={styles.composeInput}
            multiline
            onChangeText={(text) => this.setState({ editing: text.length > 0 })}
            placeholder="Start typing.."
          />
          {this.state.editing ? this.renderSendButton() : <View />}
        </View>
      </View>
    );
  }
}
