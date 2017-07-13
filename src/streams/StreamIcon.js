/* @flow */
import React from 'react';

import { IconMute, IconStream, IconPrivate } from '../common/Icons';

type Props = {
  color: string,
  isPrivate: boolean,
  isMuted: boolean,
  size: number,
  style?: Object,
};

export default ({ color, style, isPrivate, isMuted, size }: Props) => {
  const StreamIcon = isMuted ? IconMute : isPrivate ? IconPrivate : IconStream;

  return <StreamIcon size={size} color={color} style={style} />;
};
