import {createIconSet} from 'react-native-vector-icons';
import emojiMap, { emoticonToEmojiMap, commonEmoticonList, textCodeList, emojiToTextCodeMap } from './emojiMap';

const Icon = createIconSet(emojiMap, 'AppleColorEmoji');

export default Icon;

const getEmojiFromEmoticons = (emoticons: string): string => String.fromCodePoint(parseInt(emoticons, 16));

export const replaceEmoticonToEmoji = (text: string) => {
  let found = false;
  let index = 0;
  for (let i = 0; i < commonEmoticonList.length; i++) {
    const emoticon = commonEmoticonList[i];
    if (text.includes(emoticon)) {
      found = true;
      index = i;
    }
  }
  if (found) {
    const emoticon = commonEmoticonList[index];
    const presenterCode = getEmojiFromEmoticons(emoticonToEmojiMap[emoticon]);
    text = text.replace(emoticon, presenterCode);
  }
  return (text);
};

export const replaceEmojiWithTextCode = (text : string) => {
  for (let i = 0; i < textCodeList.length; i++) {
    const re = new RegExp(textCodeList[i], 'g');
    text = text.replace(re, emojiToTextCodeMap[textCodeList[i]]);
  }
  return text;
};
