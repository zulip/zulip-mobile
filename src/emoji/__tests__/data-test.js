/* @flow strict-local */
import { codeToEmojiMap, getFilteredEmojis } from '../data';

/* eslint-disable no-multi-spaces */
describe('codeToEmojiMap', () => {
  // Tell ESLint to recognize `check` as a helper function that runs
  // assertions.
  /* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "check"] }] */
  const check = (name, string1, string2) => {
    expect(string1).toEqual(string2);
    expect(codeToEmojiMap[name]).toEqual(string1);
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
  test('empty query returns many emojis', () => {
    const list = getFilteredEmojis('', []);
    // 1400 so that we don't have to change the test every time we change the
    // emoji map, while still ensuring that enough emoji are there that we can
    // be reasonably confident it's all of them.
    expect(list.length).toBeGreaterThan(1400);
  });

  test('non existing query returns empty list', () => {
    const list = getFilteredEmojis('qwerty', []);
    expect(list).toHaveLength(0);
  });

  test('returns a sorted list of emojis starting with query', () => {
    const list = getFilteredEmojis('go', []);
    expect(list).toEqual([
      { emoji_type: 'unicode', emoji_code: '1f3c1', emoji_name: 'go' },
      { emoji_type: 'unicode', emoji_code: '1f945', emoji_name: 'goal' },
      { emoji_type: 'unicode', emoji_code: '1f410', emoji_name: 'goat' },
      { emoji_type: 'unicode', emoji_code: '1f47a', emoji_name: 'goblin' },
      { emoji_type: 'unicode', emoji_code: '1f947', emoji_name: 'gold' },
      { emoji_type: 'unicode', emoji_code: '1f4bd', emoji_name: 'gold_record' },
      { emoji_type: 'unicode', emoji_code: '1f3cc', emoji_name: 'golf' },
      { emoji_type: 'unicode', emoji_code: '1f6a0', emoji_name: 'gondola' },
      { emoji_type: 'unicode', emoji_code: '1f31b', emoji_name: 'goodnight' },
      { emoji_type: 'unicode', emoji_code: '1f945', emoji_name: 'gooooooooal' },
      { emoji_type: 'unicode', emoji_code: '1f98d', emoji_name: 'gorilla' },
      { emoji_type: 'unicode', emoji_code: '1f44c', emoji_name: 'got_it' },
      { emoji_type: 'unicode', emoji_code: '1f616', emoji_name: 'agony' },
      { emoji_type: 'unicode', emoji_code: '2705', emoji_name: 'all_good' },
      { emoji_type: 'unicode', emoji_code: '1f361', emoji_name: 'dango' },
      { emoji_type: 'unicode', emoji_code: '1f409', emoji_name: 'dragon' },
      { emoji_type: 'unicode', emoji_code: '1f432', emoji_name: 'dragon_face' },
      { emoji_type: 'unicode', emoji_code: '1f4b8', emoji_name: 'easy_come_easy_go' },
      { emoji_type: 'unicode', emoji_code: '1f49b', emoji_name: 'heart_of_gold' },
      { emoji_type: 'unicode', emoji_code: '1f3a0', emoji_name: 'merry_go_round' },
      { emoji_type: 'unicode', emoji_code: '1f6d1', emoji_name: 'octagonal_sign' },
      { emoji_type: 'unicode', emoji_code: '1f54d', emoji_name: 'synagogue' },
      { emoji_type: 'unicode', emoji_code: '264d', emoji_name: 'virgo' },
    ]);
  });

  test('returns literal emoji', () => {
    const list = getFilteredEmojis('🖤', []);
    expect(list).toEqual([
      { emoji_type: 'unicode', emoji_code: '1f5a4', emoji_name: 'black_heart' },
    ]);
  });

  test('returns multiple literal emoji', () => {
    const list = getFilteredEmojis('👍', []);
    expect(list).toEqual([
      { emoji_type: 'unicode', emoji_code: '1f44d', emoji_name: '+1' },
      { emoji_type: 'unicode', emoji_code: '1f44d', emoji_name: 'thumbs_up' },
    ]);
  });

  test('search in realm emojis as well', () => {
    expect(
      getFilteredEmojis('qwerty', [
        {
          emoji_type: 'image',
          emoji_code: '654',
          emoji_name: 'qwerty',
        },
      ]),
    ).toEqual([{ emoji_name: 'qwerty', emoji_type: 'image', emoji_code: '654' }]);
  });

  test('remove duplicates', () => {
    expect(getFilteredEmojis('dog', [])).toEqual([
      { emoji_type: 'unicode', emoji_code: '1f415', emoji_name: 'dog' },
      { emoji_type: 'unicode', emoji_code: '1f94b', emoji_name: 'dogi' },
      { emoji_type: 'unicode', emoji_code: '1f32d', emoji_name: 'hotdog' },
    ]);
    expect(
      getFilteredEmojis('dog', [
        {
          emoji_type: 'image',
          emoji_code: '345',
          emoji_name: 'dog',
        },
      ]),
    ).toEqual([
      { emoji_type: 'image', emoji_code: '345', emoji_name: 'dog' },
      { emoji_type: 'unicode', emoji_code: '1f94b', emoji_name: 'dogi' },
      { emoji_type: 'unicode', emoji_code: '1f32d', emoji_name: 'hotdog' },
    ]);
  });

  test('prioritizes popular emoji', () => {
    expect(getFilteredEmojis('oct', [])).toEqual([
      // Octopus is prioritized, despite octagonal_sign coming first in
      // alphabetical order.
      { emoji_type: 'unicode', emoji_code: '1f419', emoji_name: 'octopus' },
      { emoji_type: 'unicode', emoji_code: '1f6d1', emoji_name: 'octagonal_sign' },
    ]);
  });
});
