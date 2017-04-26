import React from 'react';
import { View } from 'react-native';
import renderHtmlChildren from '../renderHtmlChildren';

export default ({ onPress, href, ...restProps }) => (
  <View onPress={() => onPress(href)}>
    {renderHtmlChildren({ onPress, ...restProps })}
  </View>
);
