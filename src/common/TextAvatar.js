/* @flow */
import React, { PureComponent } from 'react';
import { Text, StyleSheet, View } from 'react-native';

import type { ChildrenArray } from '../types';
import Touchable from './Touchable';
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

/**
 * Renders a text avatar based on user initials and a color
 * calculated as a hash from their name.
 *
 * @prop name - User's full name to extract initials from.
 * @prop size - Sets width and height in pixels.
 * @prop shape - One of 'square', 'rounded', 'circle'.
 * @prop children - If provided, will render inside the component body.
 * @prop onPress - Event fired on pressing the component.
 */
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
          <Text style={[styles.text, textSize]}>{initialsFromName(name)}</Text>
          {children}
        </View>
      </Touchable>
    );
  }
}
