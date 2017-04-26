import emojiMap, { emoticonToEmojiMap, commonEmoticonList } from './emojiMap';

const getEmojiFromEmoticons = (emoticons: string) => String.fromCodePoint(parseInt(emoticons, 16));

const convertToRegex = (emoticon: string): string => {
  let regex = emoticon.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
  return new RegExp(regex + '+$');
};

export const replaceEmoticonWithEmoji = (text: string) => {
  for (let i = 0; i < commonEmoticonList.length; i++) {
    const emoticon = commonEmoticonList[i];
    if (text.substr(-7, text.length).includes(emoticon)) {
      text = text.replace(
        convertToRegex(emoticon), getEmojiFromEmoticons(emoticonToEmojiMap[emoticon]));
    }
  }

  console.log(text);
  return (text);
};

