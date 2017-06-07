/* @flow */
import React from 'react';
import { Text } from 'react-native';
import type { StyleObj } from 'react-native/Libraries/StyleSheet/StyleSheetTypes';

import styles from '../styles';

type Props = {
  text: string,
  style?: StyleObj,
};

export default ({ text, style, ...restProps }: Props) => (
  <Text style={[styles.label, style]} {...restProps}>
    {text}
  </Text>
);
