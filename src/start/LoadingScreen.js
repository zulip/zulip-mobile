/* @flow */
import React, { PureComponent } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { BRAND_COLOR } from '../styles';

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default class LoadingScreen extends PureComponent {
  render() {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={BRAND_COLOR} size="large" />
      </View>
    );
  }
}
