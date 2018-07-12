/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

const styles = StyleSheet.create({
  separator: {
    height: 1,
    backgroundColor: 'rgba(127, 127, 127, 0.75)',
  },
});

export default class SectionSeparator extends PureComponent<{}> {
  render() {
    return <View style={styles.separator} />;
  }
}
