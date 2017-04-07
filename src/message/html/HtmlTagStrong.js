import React from 'react';
import {Text} from 'react-native';

import styles from './HtmlStyles';
import renderHtmlChildren from './renderHtmlChildren';

export default ({target, auth, childrenNodes, cascadingStyle, onPress}) => (
  <Text style={[styles.b, cascadingStyle]}>
    {renderHtmlChildren({childrenNodes, auth, cascadingStyle})}
  </Text>
);
