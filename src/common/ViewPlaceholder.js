/* @flow */
import React from 'react';
import { View } from 'react-native';

type Props = {
  width?: number,
  height?: number,
};

export default ({ height, width }: Props) => <View style={{ width, height }} />;
