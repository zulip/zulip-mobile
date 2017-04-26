import React from 'react';
import entities from 'entities';
import { Text } from 'react-native';

export default ({ data, style, cascadingStyle }) => (
  <Text style={[style, cascadingStyle]}>
    {entities.decodeHTML(data).replace(/\n$/, '')}
  </Text>
);
