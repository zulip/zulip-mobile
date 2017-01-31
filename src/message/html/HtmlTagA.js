import React from 'react';
import { Linking, Text } from 'react-native';

import renderHtmlChildren from './renderHtmlChildren';

export default ({ href, auth, childrenNodes, cascadingStyle, onPress }) => (
  <Text onPress={() => Linking.openURL(href)}>
    {renderHtmlChildren({ childrenNodes, auth, cascadingStyle })}
  </Text>
);
