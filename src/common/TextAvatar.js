/* @flow */
import React from 'react';
import { Text, StyleSheet, View } from 'react-native';

import { Touchable } from './';
import UserStatusIndicator from '../common/UserStatusIndicator';

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
  status: {
    marginLeft: 21,
    marginTop: 11,
    position: 'absolute',
  },
  frame: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
  }
});

type FuncArguments = {
  name: string,
  size: number,
  status?: string,
  isCircular?: boolean,
  onPress?: () => void
};


export default ({ name, size, status, isCircular, onPress }: FuncArguments) => {
  const frameSize = {
    height: size,
    width: size,
    borderRadius: isCircular ? size / 2 : size / 8,
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
        {status &&
          <UserStatusIndicator
            style={styles.status}
            status={status}
          />
        }
      </View>
    </Touchable>
  );
};
