/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Logo } from '../common';
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
        <Text style={styles.text}>This app is too old!</Text>
        <Text style={styles.text}>Please download the latest version from the App Store.</Text>
      </View>
    );
  }
}
