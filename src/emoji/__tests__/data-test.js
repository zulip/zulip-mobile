import { getFilteredEmojiNames, nameToEmojiMap } from '../data';
import { unicodeCodeByName } from '../../emoji/codePointMap';

// Prettier disabled in .prettierignore ; it misparses this file, apparently
// because of the emoji.  (Even if they're tucked away in comments, it still
// gets it wrong.)

/* eslint-disable no-multi-spaces, spellcheck/spell-checker */
describe('nameToEmojiMap', () => {
  const check = (name, string1, string2) => {
    expect(string1).toEqual(string2);
    expect(nameToEmojiMap(unicodeCodeByName)[name]).toEqual(string1);
  };

  test('works for some single-codepoint emoji', () => {
    check('thumbs_up', '👍', '\u{1f44d}');
    check('pride',     '🌈', '\u{1f308}');
    check('rainbow',   '🌈', '\u{1f308}');
  });

  test('works for some multi-codepoint emoji', () => {
    check('0',        '0⃣', '0\u{20e3}');
    check('asterisk', '*⃣', '*\u{20e3}');
    check('hash',     '#⃣', '#\u{20e3}');
  });
});

describe('getFilteredEmojiNames', () => {
  test('empty query returns all emojis', () => {
    const list = getFilteredEmojiNames('', {}, unicodeCodeByName);
    expect(list).toHaveLength(1560);
  });

  test('non existing query returns empty list', () => {
    const list = getFilteredEmojiNames('qwerty', {}, unicodeCodeByName);
    expect(list).toHaveLength(0);
  });

  test('returns a sorted list of emojis starting with query', () => {
    const list = getFilteredEmojiNames('go', {}, unicodeCodeByName);
    expect(list).toEqual([
      'go',
      'goal',
      'goat',
      'goblin',
      'gold',
      'gold_record',
      'golf',
      'gondola',
      'goodnight',
      'gooooooooal',
      'gorilla',
      'got_it',
    ]);
  });

  test('search in realm emojis as well', () => {
    expect(getFilteredEmojiNames('qwerty', { qwerty: {} }, unicodeCodeByName)).toEqual(['qwerty']);
  });

  test('remove duplicates', () => {
    expect(getFilteredEmojiNames('dog', {}, unicodeCodeByName)).toEqual(['dog', 'dogi']);
    expect(getFilteredEmojiNames('dog', { dog: {} }, unicodeCodeByName)).toEqual(['dog', 'dogi']);
  });
});
