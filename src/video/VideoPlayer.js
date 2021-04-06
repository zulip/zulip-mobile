/* @flow strict-local */

import React from 'react';
import Video from 'react-native-video';
import type { Message } from '../types';

type Props = $ReadOnly<{|
  src: string,
  message: Message,
|}>;

export default function VideoPlayer(props: Props) {
  // eslint-disable-next-line no-unused-vars
  const { src, message } = props;
  return (
    <Video />
  );
}
