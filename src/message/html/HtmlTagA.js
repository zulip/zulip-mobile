import React from 'react';
import { Linking, Text } from 'react-native';

import renderHtmlChildren from './renderHtmlChildren';
import { Touchable } from '../../common';

export default ({ target, auth, childrenNodes, cascadingStyle, onPress }) => (
  <Touchable onPress={() => Linking.openURL(target)}>
    <Text>
      {renderHtmlChildren({ childrenNodes, auth, cascadingStyle })}
    </Text>
  </Touchable>
);
