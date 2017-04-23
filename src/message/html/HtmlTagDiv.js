import React from 'react';
import { View } from 'react-native';

import renderHtmlChildren from './renderHtmlChildren';

export default ({ style, ...restProps }) => (
  <View style={style}>
    {renderHtmlChildren({ ...restProps })}
  </View>
);
