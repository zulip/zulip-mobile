import React from 'react';
import { Text } from 'react-native';

import styles from '../styles';

export default ({ children, style, ...restProps }) => (
  <Text style={[styles.label, style]} {...restProps}>
    {children}
  </Text>
);
