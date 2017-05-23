/* @flow */
import React from 'react';
import { Text } from 'react-native';

import styles from '../styles';

type FuncArguments = {
  text: string,
  style: string
}

export default ({ text, style, ...restProps }: FuncArguments) => (
  <Text style={[styles.label, style]} {...restProps}>
    {text}
  </Text>
);
