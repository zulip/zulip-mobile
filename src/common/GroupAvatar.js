/* @flow strict-local */
import React, { PureComponent } from 'react';
import { Text, StyleSheet, View } from 'react-native';

import type { Node as React$Node } from 'react';
import Touchable from './Touchable';
import { colorHashFromString, foregroundColorFromBackground } from '../utils/color';
import { initialsFromString } from '../utils/misc';

const styles = StyleSheet.create({
  frame: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
  },
});

type Props = $ReadOnly<{|
  names: string,
  size: number,
  shape: 'rounded' | 'square',
  children?: React$Node,
  onPress?: () => void,
|}>;

/**
 * Renders a text avatar based on a single or multiple user's
 * initials and a color calculated as a hash from their name.
 * We are currently using it only for group chats.
 *
 * @prop names - The name of one or more users, used to extract their initials.
 * @prop size - Sets width and height in pixels.
 * @prop [shape]
 * @prop children - If provided, will render inside the component body.
 * @prop onPress - Event fired on pressing the component.
 */
export default class GroupAvatar extends PureComponent<Props> {
  static defaultProps = {
    shape: 'rounded',
  };

  render() {
    const { children, names, size, shape, onPress } = this.props;

    const frameSize = {
      height: size,
      width: size,
      borderRadius: shape === 'rounded' ? size / 8 : 0,
      backgroundColor: colorHashFromString(names),
    };
    const textSize = {
      fontSize: size / 3,
      color: foregroundColorFromBackground(frameSize.backgroundColor),
    };

    return (
      <Touchable onPress={onPress}>
        <View style={[styles.frame, frameSize]}>
          <Text style={[styles.text, textSize]}>{initialsFromString(names)}</Text>
          {children}
        </View>
      </Touchable>
    );
  }
}
