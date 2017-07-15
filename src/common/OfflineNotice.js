/* @flow */
import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';

import { Label } from '../common';

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
    color: 'white',
  },
});

export default class OfflineNotice extends PureComponent {
  render() {
    return (
      <View style={styles.block}>
        <Label style={styles.text} text="No Internet connection" />
      </View>
    );
  }
}
