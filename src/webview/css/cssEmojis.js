/* @flow strict-local */
import { codeToEmojiMap } from '../../emoji/data';

const codeToCss = (code: string): string =>
  `.emoji-${code}:before { content: '${codeToEmojiMap[code]}'; }`;

const cssEmojis: string = Object.keys(codeToEmojiMap)
  .map(key => codeToCss(key))
  .join('\n');

export default cssEmojis;
