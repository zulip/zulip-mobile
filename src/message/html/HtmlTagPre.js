import React from 'react';
import {View} from 'react-native';

import HtmlTagSpan from './HtmlTagSpan';

export default ({style, data, childrenNodes, cascadingStyle}) => (
  <View style={style}>
    <HtmlTagSpan
      childrenNodes={childrenNodes}
      cascadingStyle={cascadingStyle}
    />
  </View>
);
