import React from 'react';
import {View} from 'react-native';

import renderHtmlChildren from './renderHtmlChildren';

export default ({auth, style, cascadingStyle, childrenNodes}) => (
  <View style={style}>
    {renderHtmlChildren({childrenNodes, auth, cascadingStyle})}
  </View>
);
