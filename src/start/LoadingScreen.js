/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { BRAND_COLOR } from '../styles';
import { LoadingIndicator } from '../common';

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BRAND_COLOR,
  },
});

export default class LoadingScreen extends PureComponent<{}> {
  render() {
    return (
      <View style={styles.center}>
        <LoadingIndicator color="0, 0, 0" size={80} showLogo />
      </View>
    );
  }
}
