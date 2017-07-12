/* @flow */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import type { StyleObj } from '../types';
import { BRAND_COLOR, CONTROL_SIZE } from '../styles';
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
  },
});

type Props = {
  name: string,
  color?: ?string,
  showCircle?: boolean,
  onPress: () => void,
  style?: StyleObj,
};

export default ({ name, color, showCircle, onPress, style }: Props) =>
  <Touchable onPress={onPress}>
    <View style={styles.frame}>
      <Icon style={[styles.icon, style]} color={color || BRAND_COLOR} name={name} />
      {showCircle && <View style={[styles.circle, { backgroundColor: color }]} />}
    </View>
  </Touchable>;
