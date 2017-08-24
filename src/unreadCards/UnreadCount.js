/* @flow */
import React, { PureComponent } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 20,
    borderRadius: 100,
    padding: 8,
    backgroundColor: '#E34730',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    borderRadius: 100,
  },
});

export default class StreamUnreadCount extends PureComponent {
  props: {
    count: number,
  };

  render() {
    const { count } = this.props;

    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          {count}
        </Text>
      </View>
    );
  }
}
