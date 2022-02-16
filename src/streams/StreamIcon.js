/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import type { TextStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import { IconMute, IconStream, IconPrivate } from '../common/Icons';

type Props = $ReadOnly<{|
  color?: string,
  isPrivate: boolean,
  isMuted: boolean,
  size: number,
  style?: TextStyleProp,
|}>;

export default ({ color, style, isPrivate, isMuted, size }: Props): Node => {
  let StreamIcon = undefined;
  if (isMuted) {
    StreamIcon = IconMute;
  } else if (isPrivate) {
    StreamIcon = IconPrivate;
  } else {
    StreamIcon = IconStream;
  }

  return <StreamIcon size={size} color={color} style={style} />;
};
