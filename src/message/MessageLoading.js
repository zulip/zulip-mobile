/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

const styles = StyleSheet.create({
  message: {
    flexDirection: 'row',
    padding: 8,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    marginLeft: 8,
  },
  avatar: {
    backgroundColor: 'rgba(127, 127, 127, 0.25)',
    borderRadius: 32 / 8,
    width: 32,
    height: 32,
  },
  block: {
    backgroundColor: 'rgba(127, 127, 127, 0.25)',
    borderRadius: 10,
    height: 8,
    marginBottom: 10,
  },
});

export default class MessageLoading extends PureComponent<void> {
  render() {
    return (
      <View style={styles.message}>
        <View style={styles.avatar} />
        <View style={styles.content}>
          <View style={styles.block} />
          <View style={styles.block} />
          <View style={styles.block} />
        </View>
      </View>
    );
  }
}
