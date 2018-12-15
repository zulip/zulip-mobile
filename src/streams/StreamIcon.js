/* @flow strict-local */
import React from 'react';

import { IconMute, IconStream, IconPrivate } from '../common/Icons';
import type { Style } from '../types';

type Props = {|
  color?: string,
  isPrivate: boolean,
  isMuted: boolean,
  size: number,
  style?: Style,
|};

export default ({ color, style, isPrivate = false, isMuted = false, size }: Props) => {
  const StreamIcon = isMuted ? IconMute : isPrivate ? IconPrivate : IconStream;

  return <StreamIcon size={size} color={color} style={style} />;
};
