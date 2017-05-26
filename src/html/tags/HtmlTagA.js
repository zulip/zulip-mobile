import React from 'react';
import { View } from 'react-native';

import { Touchable } from '../../common';
import renderHtmlChildren from '../renderHtmlChildren';

export default ({ onPress, href, ...restProps }) => (
  <Touchable onPress={() => onPress(href)} >
    <View>
      {renderHtmlChildren({ href, ...restProps })}
    </View>
  </Touchable>
);
