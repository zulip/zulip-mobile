import React from 'react';

import { Touchable } from '../../common';
import renderHtmlChildren from '../renderHtmlChildren';

export default ({ onPress, href, ...restProps }) => (
  <Touchable onPress={() => onPress(href)}>
    {renderHtmlChildren({ href, ...restProps })}
  </Touchable>
);
