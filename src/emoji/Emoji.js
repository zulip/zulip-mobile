/* @flow strict-local */
import { createIconSet } from 'react-native-vector-icons';
import { nameToEmojiMap } from './data';

/* $FlowFixMe: `nameToEmojiMap` is mistyped upstream; elements of
  `glyphMap` may be either `number` or `string`. */
const Icon = createIconSet(nameToEmojiMap, 'AppleColorEmoji');

export default Icon;
