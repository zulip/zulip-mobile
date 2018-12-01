/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';

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
    const pleaseDownloadMsg =
      Platform.OS === 'ios'
        ? 'Please download the latest version from the App Store.'
        : 'Please download the latest version from the Play Store.';
    return (
      <View style={styles.screen}>
        <Text style={styles.text}>This app is too old!</Text>
        <Text style={styles.text}>{pleaseDownloadMsg}</Text>
      </View>
    );
  }
}
