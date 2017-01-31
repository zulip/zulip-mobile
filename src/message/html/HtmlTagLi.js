import React from 'react';
import { Text } from 'react-native';

import renderHtmlChildren from './renderHtmlChildren';

const BULLET = '\u2022';

export default ({ auth, childrenNodes, cascadingStyle }) => (
  <Text>
    {BULLET} {renderHtmlChildren({ childrenNodes, auth, cascadingStyle })}
  </Text>
);
