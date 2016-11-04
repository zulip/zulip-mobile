import React from 'react';
import {
  View,
} from 'react-native';

import { BRAND_COLOR, NAVBAR_HEIGHT, STATUSBAR_HEIGHT } from '../common/styles';

const styles = StyleSheet.create({
  statusBar: {
    height: STATUSBAR_HEIGHT,
  },
});

export default () =>
  <View style={styles.statusBar} />;
