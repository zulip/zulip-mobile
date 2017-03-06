import React from 'react';

import { IconMute, IconStream, IconPrivate } from '../common/Icons';

export default ({ color, style, isPrivate, isMuted, size }) => {
  const StreamIcon = (isMuted ? IconMute : (isPrivate ? IconPrivate : IconStream));

  return (
    <StreamIcon
      size={size}
      color={color}
      style={style}
    />
  );
};
