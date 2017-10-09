/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { CONTROL_SIZE } from '../styles';

const styles = StyleSheet.create({
  placeholder: {
    width: CONTROL_SIZE,
    height: CONTROL_SIZE,
  },
});

export default class NavButtonPlaceholder extends PureComponent<void> {
  render() {
    return <View style={styles.placeholder} />;
  }
}
