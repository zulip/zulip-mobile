import React from 'react';
import entities from 'entities';
import { Text } from 'react-native';

import styles from '../../styles';

export default ({ data, style, cascadingStyle }) => (
  <Text style={[style, cascadingStyle, styles.color]}>
    {entities.decodeHTML(data).replace(/\n$/, '')}
  </Text>
);
