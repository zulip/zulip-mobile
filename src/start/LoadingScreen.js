/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { BRAND_COLOR } from '../styles';
import { LoadingIndicator, ZulipStatusBar } from '../common';

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BRAND_COLOR,
  },
});

export default class LoadingScreen extends PureComponent<{||}> {
  render() {
    return (
      <View style={styles.center}>
        <ZulipStatusBar backgroundColor={BRAND_COLOR} />
        <LoadingIndicator color="black" size={80} showLogo />
      </View>
    );
  }
}
