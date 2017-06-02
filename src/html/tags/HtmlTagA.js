import React from 'react';

import styles from '../HtmlStyles';
import { Touchable } from '../../common';
import renderHtmlChildren from '../renderHtmlChildren';

export default ({ onPress, href, cascadingStyle, ...restProps }) => (
  <Touchable style={[styles.a, cascadingStyle]} onPress={() => onPress(href)}>
    {renderHtmlChildren({ href, ...restProps })}
  </Touchable>
);
