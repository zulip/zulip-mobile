/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { NAVBAR_SIZE } from '../styles';

const styles = StyleSheet.create({
  placeholder: {
    width: NAVBAR_SIZE,
    height: NAVBAR_SIZE,
  },
});

export default class NavButtonPlaceholder extends PureComponent<{}> {
  render() {
    return <View style={styles.placeholder} />;
  }
}
