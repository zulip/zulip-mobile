import { replaceEmoticonsWithEmoji } from '../emoticons';

describe('replaceEmoticonsWithEmoji', () => {
  test('empty string produces empty string', () => {
    expect(replaceEmoticonsWithEmoji('')).toEqual('');
  });

  test('when no emoticons, return the same string', () => {
    const input = 'String with no emoticons.';

    const result = replaceEmoticonsWithEmoji(input);

    expect(result).toEqual(input);
  });

  test('replaces an emoticon with a related emoji', () => {
    const input = ':)';

    const result = replaceEmoticonsWithEmoji(input);

    expect(result).toEqual('🙂');
  });

  test('does not replace emoticons if not a separate word', () => {
    const input = ':):):)';

    const result = replaceEmoticonsWithEmoji(input);

    expect(result).toEqual(input);
  });

  test('replaces only emoticons, leaves text as-is', () => {
    const input = 'I <3 Zulip';

    const result = replaceEmoticonsWithEmoji(input);

    expect(result).toEqual('I ❤️ Zulip');
  });

  test('recognizes a wide range of emoticons', () => {
    const input = ':) :p :P';

    const result = replaceEmoticonsWithEmoji(input);

    expect(result).toEqual('🙂 😛 😛');
  });
});
