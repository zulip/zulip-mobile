/* @flow strict-local */
import { getFilteredEmojiNames, nameToEmojiMap } from '../data';

// Prettier disabled in .prettierignore ; it misparses this file, apparently
// because of the emoji.  (Even if they're tucked away in comments, it still
// gets it wrong.)

/* eslint-disable no-multi-spaces, spellcheck/spell-checker */
describe('nameToEmojiMap', () => {
  const check = (name, string1, string2) => {
    expect(string1).toEqual(string2);
    expect(nameToEmojiMap[name]).toEqual(string1);
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
    const list = getFilteredEmojiNames('', {});
    expect(list).toHaveLength(1560);
  });

  test('non existing query returns empty list', () => {
    const list = getFilteredEmojiNames('qwerty', {});
    expect(list).toHaveLength(0);
  });

  test('returns a sorted list of emojis starting with query', () => {
    const list = getFilteredEmojiNames('go', {});
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
      'agony',
      'all_good',
      'dango',
      'dragon',
      'dragon_face',
      'easy_come_easy_go',
      'heart_of_gold',
      'merry_go_round',
      'octagonal_sign',
      'synagogue',
      'virgo',
    ]);
  });

  test('search in realm emojis as well', () => {
    expect(
      getFilteredEmojiNames('qwerty', {
        qwerty: { code: '654', deactivated: false, name: 'qwerty', source_url: 'url' },
      }),
    ).toEqual(['qwerty']);
  });

  test('remove duplicates', () => {
    expect(getFilteredEmojiNames('dog', {})).toEqual(['dog', 'dogi', 'hotdog']);
    expect(
      getFilteredEmojiNames('dog', {
        dog: {
          code: '345',
          deactivated: false,
          name: 'dog',
          source_url: 'url',
        },
      }),
    ).toEqual(['dog', 'dogi', 'hotdog']);
  });
});
