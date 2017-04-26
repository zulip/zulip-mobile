import React from 'react';
import { View } from 'react-native';

import renderHtmlChildren from '../renderHtmlChildren';

export default ({ style, cascadingStyle, ...restProps }) => (
  <View style={[style, cascadingStyle]}>
    {renderHtmlChildren({ ...restProps })}
  </View>
);
