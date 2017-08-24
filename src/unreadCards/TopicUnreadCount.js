/* @flow */
import React, { PureComponent } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    padding: 3,
    backgroundColor: '#979797',
    marginLeft: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 10,
    borderRadius: 100,
  },
});

export default class TopicUnreadCount extends PureComponent {
  props: {
    count: number
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
  };
};
