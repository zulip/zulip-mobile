/* @flow strict-local */
import { displayCharacterForUnicodeEmojiCode, getFilteredEmojis } from '../data';

describe('displayCharacterForUnicodeEmojiCode', () => {
  // Tell ESLint to recognize `check` as a helper function that runs
  // assertions.
  /* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "check"] }] */
  const check = (emojiCode, string1, string2) => {
    expect(string1).toEqual(string2);
    expect(displayCharacterForUnicodeEmojiCode(emojiCode, null)).toEqual(string1);
  };

  test('works for some single-codepoint emoji', () => {
    check('1f44d', '👍', '\u{1f44d}');
    check('1f308', '🌈', '\u{1f308}');
  });

  // test_('works for some multi-codepoint emoji', () => {
  //   The only multi-codepoint emoji in the list are keypad emoji,
  //   which are special in a different way.

  test('works for some overridden keypad emoji', () => {
    check('0030-20e3', '0️⃣', '0\u{fe0f}\u{20e3}');
    check('002a-20e3', '*️⃣', '*\u{fe0f}\u{20e3}');
    check('0023-20e3', '#️⃣', '#\u{fe0f}\u{20e3}');
  });
});

describe('getFilteredEmojis', () => {
  const names = query => getFilteredEmojis(query, []).map(e => e.emoji_name);

  test('empty query returns many emojis', () => {
    // 1400 so that we don't have to change the test every time we change the
    // emoji map, while still ensuring that enough emoji are there that we can
    // be reasonably confident it's all of them.
    expect(names('').length).toBeGreaterThan(1400);
  });

  test('non existing query returns empty list', () => {
    expect(names('qwerty')).toHaveLength(0);
  });

  test('returns a sorted list of emojis starting with query', () => {
    expect(names('go')).toEqual([
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

  test('matches starting at non-first word, too', () => {
    expect(names('ice_cream')).toEqual(['ice_cream', 'soft_ice_cream']);
    expect(names('blue_dia')).toEqual(['large_blue_diamond', 'small_blue_diamond']);
    // And the prefix match comes first, even when it'd be later alphabetically:
    expect(names('police_')).toEqual(['police_car', 'oncoming_police_car']);
  });

  describe('matches query with spaces instead of underscores', () => {
    for (const query of ['big smile', 'ice cream', 'blue dia', 'police ', 'police c']) {
      test(query, () => expect(names(query)).toEqual(names(query.replace(' ', '_'))));
    }
  });

  test('returns literal emoji', () => {
    expect(names('🖤')).toEqual(['black_heart']);
  });

  test('returns multiple literal emoji', () => {
    expect(names('👍')).toEqual(['+1', 'thumbs_up']);
  });

  test('search in realm emojis as well', () => {
    const emoji = { emoji_type: 'image', emoji_code: '654', emoji_name: 'qwerty' };
    expect(getFilteredEmojis('qwerty', [emoji])).toEqual([emoji]);
  });

  test('remove duplicates', () => {
    expect(names('dog')).toEqual(['dog', 'dogi', 'hotdog']);
    const emoji = { emoji_type: 'image', emoji_code: '345', emoji_name: 'dog' };
    expect(getFilteredEmojis('dog', [emoji])).toEqual([
      { emoji_type: 'image', emoji_code: '345', emoji_name: 'dog' },
      { emoji_type: 'unicode', emoji_code: '1f94b', emoji_name: 'dogi' },
      { emoji_type: 'unicode', emoji_code: '1f32d', emoji_name: 'hotdog' },
    ]);
  });

  test('prioritizes popular emoji', () => {
    // :octopus: is prioritized, despite :octagonal_sign: coming first in
    // alphabetical order.
    expect(names('oct')).toEqual(['octopus', 'octagonal_sign']);
  });
});
