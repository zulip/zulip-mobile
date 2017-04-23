import React from 'react';
import { Text } from 'react-native';

import renderHtmlChildren from './renderHtmlChildren';

export default ({ style, cascadingStyle, ...restProps }) => (
  <Text style={[style, cascadingStyle]}>
    {renderHtmlChildren({ ...restProps })}
  </Text>
);
