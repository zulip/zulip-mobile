import React from 'react';
import { StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { CONTROL_SIZE } from '../common/platform';
import { Touchable } from '../common';

const styles = StyleSheet.create({
  touchable: {
    width: CONTROL_SIZE,
    height: CONTROL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    textAlign: 'center',
    fontSize: 26,
  },
});

export default ({ name, color, onPress }) => (
  <Touchable style={styles.touchable} onPress={onPress}>
    <Icon style={styles.icon} color={color} name={name} />
  </Touchable>
);
