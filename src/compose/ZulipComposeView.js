import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
} from 'react-native';

const COMPOSE_VIEW_HEIGHT = 44;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    borderTopWidth: 1,
    borderTopColor: '#999',
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
    fontSize: 14,
    backgroundColor: '#eee',
  },
  streamInput: {
    flex: 1,
    padding: 8,
    fontSize: 14,
    backgroundColor: '#ccc',
  },
  composeInput: {
    flex: 1,
    padding: 8,
    fontSize: 14,
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

export default class ZulipComposeView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: false,
    };
  }

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
            placeholder="Tell me a secret.."
          />
          {this.state.editing ? this.renderSendButton() : <View />}
        </View>
      </View>
    );
  }
}
