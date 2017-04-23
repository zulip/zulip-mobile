import React from 'react';
import { Text } from 'react-native';

import styles from './HtmlStyles';
import renderHtmlChildren from './renderHtmlChildren';

export default ({ cascadingStyle, ...restProps }) => (
  <Text style={[styles.b, cascadingStyle]}>
    {renderHtmlChildren({ cascadingStyle, ...restProps })}
  </Text>
);
