/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';
// $FlowFixMe[untyped-import]
import Color from 'color';

import Touchable from './Touchable';
import { createStyleSheet } from '../styles';
import { colorHashFromString } from '../utils/color';
import { IconGroup } from './Icons';

const styles = createStyleSheet({
  frame: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

type Props = $ReadOnly<{|
  names: $ReadOnlyArray<string>,
  size: number,
  children?: Node,
  onPress?: () => void,
|}>;

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
      backgroundColor: Color(colorHashFromString(names.join(', ')))
        .lighten(0.6)
        .hex(),
    };

    const iconColor = Color(colorHashFromString(names.join(', '))).string();

    return (
      <Touchable onPress={onPress}>
        <View style={[styles.frame, frameSize]}>
          <IconGroup size={size * 0.75} color={iconColor} />
          {children}
        </View>
      </Touchable>
    );
  }
}
