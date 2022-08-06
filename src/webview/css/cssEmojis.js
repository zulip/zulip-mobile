/* @flow strict-local */
import type { ServerEmojiData } from '../../api/modelTypes';

import { displayCharacterForUnicodeEmojiCode, availableUnicodeEmojiCodes } from '../../emoji/data';

const codeToCss = (code, serverEmojiData): string =>
  `.emoji-${code}:before { content: '${displayCharacterForUnicodeEmojiCode(
    code,
    serverEmojiData,
  )}'; }`;

const cssEmojis = (serverEmojiData: ServerEmojiData | null): string => {
  const availableCodes = serverEmojiData?.code_to_names.keys() ?? availableUnicodeEmojiCodes;

  const chunks = [];
  for (const code of availableCodes) {
    chunks.push(codeToCss(code, serverEmojiData));
  }

  return chunks.join('\n');
};

export default cssEmojis;
