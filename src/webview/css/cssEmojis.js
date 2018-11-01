/* @flow strict-local */
import type { EmojiNameToCodePoint } from '../../types';
import { codeToEmojiMap } from '../../emoji/data';

const codeToCss = (code: string, unicodeCodeByName: EmojiNameToCodePoint): string =>
  `.emoji-${code}:before { content: '${codeToEmojiMap(unicodeCodeByName)[code]}'; }`;

export default (unicodeCodeByName: EmojiNameToCodePoint) =>
  Object.keys(codeToEmojiMap(unicodeCodeByName))
    .map(key => codeToCss(key, unicodeCodeByName))
    .join('\n');
