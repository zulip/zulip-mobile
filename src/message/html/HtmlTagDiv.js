import React from 'react';
import { View } from 'react-native';

import renderHtmlChildren from './renderHtmlChildren';

export default ({ auth, style, cascadingStyle, childrenNodes }) => (
  <View style={[style, auth, cascadingStyle]}>
    {renderHtmlChildren({ childrenNodes, auth, cascadingStyle })}
  </View>
);
