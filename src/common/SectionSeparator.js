/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

const styles = StyleSheet.create({
  separator: {
    height: 1,
    margin: 10,
    backgroundColor: 'hsla(0, 0%, 49.8%, 0.75)',
  },
});

export default class SectionSeparator extends PureComponent<{}> {
  render() {
    return <View style={styles.separator} />;
  }
}
