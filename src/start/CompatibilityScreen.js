/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { Logo, Label } from '../common';
import { BRAND_COLOR } from '../styles';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: BRAND_COLOR,
  },
  text: {
    textAlign: 'center',
    color: 'white',
    fontSize: 20,
    margin: 8,
  },
});

export default class CompatibilityScreen extends PureComponent<{}> {
  render() {
    return (
      <View style={styles.screen}>
        <Logo />
        <Label style={styles.text} text="This app is too old!" />
        <Label style={styles.text} text="Please download the latest version from the App Store." />
      </View>
    );
  }
}
