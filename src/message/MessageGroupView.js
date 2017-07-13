/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View, Text } from 'react-native';

const styles = StyleSheet.create({
  threadGroup: {
    flexDirection: 'column',
    backgroundColor: '#eee',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#eee',
  },
  threadGroupHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  threadGroupStreamText: {
    backgroundColor: '#ccc',
    padding: 4,
  },
  threadGroupThreadText: {
    padding: 4,
  },
});

export default class MessageGroupView extends PureComponent {
  render() {
    const { stream, thread, children } = this.props;

    return (
      <View style={styles.threadGroup}>
        <View style={styles.threadGroupHeader}>
          <Text style={[styles.threadGroupStreamText, { backgroundColor: stream.color }]}>
            {stream.name}
          </Text>
          <Text style={styles.threadGroupThreadText}>
            {thread}
          </Text>
        </View>
        {children}
      </View>
    );
  }
}
