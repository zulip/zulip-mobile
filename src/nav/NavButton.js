import React from 'react';
import { StyleSheet, View } from 'react-native';

import { BRAND_COLOR } from '../common/styles';
import { CONTROL_SIZE } from '../common/platform';
import { Touchable } from '../common';
import Icon from '../common/Icons';

const styles = StyleSheet.create({
  frame: {
    width: CONTROL_SIZE,
    height: CONTROL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    textAlign: 'center',
    fontSize: 26,
  },
  circle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    right: 6,
    top: 6,
    position: 'absolute',
  }
});

export default ({ name, color, showCircle, onPress }) => (
  <Touchable onPress={onPress}>
    <View style={styles.frame}>
      <Icon style={styles.icon} color={color || BRAND_COLOR} name={name} />
      {showCircle && <View style={[styles.circle, { backgroundColor: color }]} />}
    </View>
  </Touchable>
);
