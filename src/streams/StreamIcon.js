/* @flow strict-local */
import React from 'react';
import type { TextStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import { IconMute, IconStream, IconPrivate } from '../common/Icons';

type Props = $ReadOnly<{|
  color?: string,
  isPrivate: boolean,
  isMuted: boolean,
  isSubscribed: boolean,
  size: number,
  style?: TextStyleProp,
|}>;

export default ({
  color,
  style,
  isPrivate = false,
  isMuted = false,
  isSubscribed = true,
  size,
}: Props) => {
  const StreamIcon = isSubscribed && isMuted ? IconMute : isPrivate ? IconPrivate : IconStream;

  return <StreamIcon size={size} color={color} style={style} />;
};
