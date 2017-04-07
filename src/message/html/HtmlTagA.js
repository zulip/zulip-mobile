import React from 'react';
import {Linking, Text} from 'react-native';

import {getFullUrl} from '../../utils/url';
import renderHtmlChildren from './renderHtmlChildren';

export default ({href, auth, childrenNodes, cascadingStyle, onPress}) => (
  <Text onPress={() => Linking.openURL(getFullUrl(href, auth.realm))}>
    {renderHtmlChildren({childrenNodes, auth, cascadingStyle})}
  </Text>
);
