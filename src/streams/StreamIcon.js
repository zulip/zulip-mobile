/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import type { TextStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import { IconMute, IconStream, IconPrivate, IconPublic } from '../common/Icons';

type Props = $ReadOnly<{|
  color?: string,
  isPrivate: boolean,
  isMuted: boolean,
  isWebPublic: boolean | void,
  size: number,
  style?: TextStyleProp,
|}>;

export default ({ color, style, isPrivate, isMuted, isWebPublic, size }: Props): Node => {
  let StreamIcon = undefined;
  if (isMuted) {
    StreamIcon = IconMute;
  } else if (isPrivate) {
    StreamIcon = IconPrivate;
  } else if (isWebPublic ?? false) {
    StreamIcon = IconPublic;
  } else {
    StreamIcon = IconStream;
  }

  return <StreamIcon size={size} color={color} style={style} />;
};
