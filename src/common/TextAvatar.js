/* @flow */
import React from 'react';
import { Text, StyleSheet, View } from 'react-native';

import { Touchable } from './';

export const colorHashFromName = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = hash * 31 + name.charCodeAt(1);
  let colorHash = hash % 0xffffff;
  if (colorHash < 0x100000) colorHash += 0x100000;
  return `#${colorHash.toString(16)}`;
};

export const initialsFromName = (name: string) =>
  (name.match(/\S+\s*/g) || []).map(x => x[0].toUpperCase()).join('');

const styles = StyleSheet.create({
  frame: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
  },
});

type Props = {
  name: string,
  size: number,
  shape: string,
  children: [],
  onPress?: () => void,
};

export default ({ name, size, status, shape, onPress, children }: Props) => {
  const frameSize = {
    height: size,
    width: size,
    borderRadius:
      shape === 'rounded' ? size / 8 : shape === 'circle' ? size / 2 : shape === 'square' ? 0 : 0,
    backgroundColor: colorHashFromName(name),
  };
  const textSize = {
    fontSize: size / 3,
  };

  return (
    <Touchable onPress={onPress}>
      <View style={[styles.frame, frameSize]}>
        <Text style={[styles.text, textSize]}>
          {initialsFromName(name)}
        </Text>
        {children}
      </View>
    </Touchable>
  );
};
