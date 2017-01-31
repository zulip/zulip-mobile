import React from 'react';
import { Text } from 'react-native';

import renderHtmlChildren from './renderHtmlChildren';

export default ({ style, auth, childrenNodes, cascadingStyle }) => (
  <Text style={[style, cascadingStyle]}>
    {renderHtmlChildren({ childrenNodes, auth })}
  </Text>
);
