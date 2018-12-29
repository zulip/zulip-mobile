/* @flow strict-local */
import React from 'react';
import { createIconSet } from 'react-native-vector-icons';

import type { EmojiNameToCodePoint } from '../types';
import { nameToEmojiMap } from './data';

type Params = {
  codePointMap: EmojiNameToCodePoint,
  name: string,
  size: number,
};

export default ({ codePointMap, ...restProps }: Params) => {
  const Icons = createIconSet(nameToEmojiMap(codePointMap), 'AppleColorEmoji');

  return <Icons {...restProps} />;
};
