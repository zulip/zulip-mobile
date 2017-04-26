import React from 'react';
import { View } from 'react-native';

import HtmlTagSpan from './HtmlTagSpan';

export default ({ style, ...restProps }) => (
  <View style={style}>
    <HtmlTagSpan {...restProps} />
  </View>
);
