/* @flow strict-local */
import { codeToEmojiMap, availableUnicodeEmojiCodes } from '../../emoji/data';

const codeToCss = (code: string): string =>
  `.emoji-${code}:before { content: '${codeToEmojiMap[code]}'; }`;

// TODO(#2956): Have caller pass available codes from server data instead.
const chunks = [];
for (const code of availableUnicodeEmojiCodes) {
  chunks.push(codeToCss(code));
}
const cssEmojis: string = chunks.join('\n');

export default cssEmojis;
