/* @flow */
import React from 'react';
import entities from 'entities';
import { Text } from 'react-native';

type FuncArguments = {
  data: string,
  style: Object,
  cascadingStyle: Object,
}

export default ({ data, style, cascadingStyle }: FuncArguments) => (
  <Text style={[style, cascadingStyle]}>
    {entities.decodeHTML(data).replace(/\n$/, '')}
  </Text>
);
