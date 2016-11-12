import React from 'react';
import {
  StyleSheet,
  View,
  TextInput,
} from 'react-native';

import { COMPOSE_VIEW_HEIGHT } from '../common/styles';

const styles = StyleSheet.create({
  threadBox: {
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
});

export default class ThreadBox extends React.PureComponent {
  render() {
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
}
