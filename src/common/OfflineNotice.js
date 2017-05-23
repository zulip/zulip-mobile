/* @flow */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  block: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#FD3D26',
  },
  text: {
    fontSize: 14,
    color: 'white'
  }
});

export default class OfflineNotice extends React.Component {
  render() {
    return (
      <View style={styles.block}>
        <Text style={styles.text}>
          No internet connection
        </Text>
      </View>
    );
  }
}
