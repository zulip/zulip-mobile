/* @flow strict-local */
/* eslint-disable */
import { codeToEmojiMap } from '../../emoji/data';

const codeToCss = (code: string): string =>
  `.emoji-${code}:before { content: '${codeToEmojiMap[code]}'; }`;

export default Object.keys(codeToEmojiMap)
  .map(key => codeToCss(key))
  .join('\n');
