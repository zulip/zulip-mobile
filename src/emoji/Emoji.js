/* @flow strict-local */
import { createIconSet } from 'react-native-vector-icons';
import { nameToEmojiMap } from './data';

const Icon = createIconSet(nameToEmojiMap, 'AppleColorEmoji');

export default Icon;
