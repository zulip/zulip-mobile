/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { Node } from 'react';
import { Text, View } from 'react-native';

import Touchable from './Touchable';
import { createStyleSheet } from '../styles';
import { colorHashFromString, foregroundColorFromBackground } from '../utils/color';

const styles = createStyleSheet({
  frame: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
  },
});

type Props = $ReadOnly<{|
  names: string[],
  size: number,
  children?: Node,
  onPress?: () => void,
|}>;

/** Private; exported only for tests. */
export const initialsForGroupIcon = (names: string[]): string => {
  const initials = names.map(item =>
    item === '' ? '' : String.fromCodePoint(item.codePointAt(0)).toUpperCase(),
  );
  if (initials.length > 4) {
    initials[3] = '…';
  }
  return initials.slice(0, 4).join('');
};

/**
 * Renders a text avatar based on a single or multiple user's
 * initials and a color calculated as a hash from their name.
 * We are currently using it only for group chats.
 *
 * @prop names - The name of one or more users, used to extract their initials.
 * @prop size - Sets width and height in logical pixels.
 * @prop children - If provided, will render inside the component body.
 * @prop onPress - Event fired on pressing the component.
 */
export default class GroupAvatar extends PureComponent<Props> {
  render(): Node {
    const { children, names, size, onPress } = this.props;

    const frameSize = {
      height: size,
      width: size,
      borderRadius: size / 8,
      backgroundColor: colorHashFromString(names.join(', ')),
    };
    const textSize = {
      fontSize: size / 3,
      color: foregroundColorFromBackground(frameSize.backgroundColor),
    };

    return (
      <Touchable onPress={onPress}>
        <View style={[styles.frame, frameSize]}>
          <Text style={[styles.text, textSize]}>{initialsForGroupIcon(names)}</Text>
          {children}
        </View>
      </Touchable>
    );
  }
}
