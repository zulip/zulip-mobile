import React from 'react';
import { Text } from 'react-native';
import renderHtmlChildren from './renderHtmlChildren';

export default ({ onPress, href, ...restProps }) => (
  <Text onPress={() => onPress(href)}>
    {renderHtmlChildren({ onPress, ...restProps })}
  </Text>
);
