import React from 'react';
import { StyleSheet, View } from 'react-native';

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
});

export default ({ name, color, onPress }) => (
  <Touchable onPress={onPress}>
    <View style={styles.frame}>
      <Icon style={styles.icon} color={color} name={name} />
    </View>
  </Touchable>
);
