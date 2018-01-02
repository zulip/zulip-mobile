/* eslint-disable */
import { codeToEmojiMap } from '../emoji/emojiMap';

const codeToCss = code => `.emoji-${code}:before { content: '${codeToEmojiMap[code]}'; }`;

export default Object.keys(codeToEmojiMap)
  .map(key => codeToCss(key))
  .join('\n');
