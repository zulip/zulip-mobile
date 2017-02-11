import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';

import { BRAND_COLOR } from '../common/styles';
import { STATUSBAR_HEIGHT } from './platform';

const styles = StyleSheet.create({
  statusbar: {
    backgroundColor: BRAND_COLOR,
    height: STATUSBAR_HEIGHT,
  },
});

export default () => (
  <View style={styles.statusbar}>
    <StatusBar
      barStyle="light-content"
      backgroundColor={BRAND_COLOR}
    />
  </View>
);
