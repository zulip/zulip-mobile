/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ChildrenArray } from '../types';
import { Touchable, Label } from './';
import { colorHashFromName } from '../utils/color';

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
  shape?: string,
  children?: ChildrenArray<*>,
  onPress?: () => void,
};

export default class TextAvatar extends PureComponent<Props> {
  props: Props;

  render() {
    const { children, name, size, shape, onPress } = this.props;

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
          <Label style={[styles.text, textSize]} text={initialsFromName(name)} />
          {children}
        </View>
      </Touchable>
    );
  }
}
