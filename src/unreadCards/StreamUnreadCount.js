/* @flow */
import React, { PureComponent } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    top: 10,
    right: 10,
    width: 35,
    height: 35,
    borderRadius: 100,
    padding: 6,
    backgroundColor: '#E34730',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  text: {
    color: '#FFFFFF'
  }
});

export default class StreamUnreadCount extends PureComponent {
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
};