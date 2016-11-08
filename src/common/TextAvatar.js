import React from 'react';
import {
  Text,
  View,
} from 'react-native';

export const colorHashFromName = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = hash * 31 + name.charCodeAt(1);
  let colorHash = hash % 0xffffff;
  if (colorHash < 0x100000) colorHash += 0x100000;
  return `#${colorHash.toString(16)}`;
};

export const initialsFromName = (name: string) =>
  name.match(/\S+\s*/g).map(x => x[0].toUpperCase()).join('');

export default ({ name, size }) => {
  const frameStyle = {
    justifyContent: 'center',
    alignItems: 'center',
    height: size,
    width: size,
    borderRadius: size / 2,
    backgroundColor: colorHashFromName(name),
  };
  const textStyle = {
    color: 'white',
    fontSize: size / 3,
  };

  return (
    <View style={frameStyle}>
      <Text style={textStyle}>{initialsFromName(name)}</Text>
    </View>
  );
};
