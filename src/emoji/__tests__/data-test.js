/* @flow strict-local */
import { codeToEmojiMap, getFilteredEmojis } from '../data';

// Prettier disabled in .prettierignore ; it misparses this file, apparently
// because of the emoji.  (Even if they're tucked away in comments, it still
// gets it wrong.)

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
    check('1f308', '🌈', '\u{1f308}');
  });
  test('works for some multi-codepoint emoji', () => {
    check('0030-20e3', '0⃣', '0\u{20e3}');
    check('002a-20e3', '*⃣', '*\u{20e3}');
    check('0023-20e3', '#⃣', '#\u{20e3}');
  });
});

describe('getFilteredEmojis', () => {
  test('empty query returns many emojis', () => {
    const list = getFilteredEmojis('', {});
    // 1400 so that we don't have to change the test every time we change the
    // emoji map, while still ensuring that enough emoji are there that we can
    // be reasonably confident it's all of them.
    expect(list.length).toBeGreaterThan(1400);
  });

  test('non existing query returns empty list', () => {
    const list = getFilteredEmojis('qwerty', {});
    expect(list).toHaveLength(0);
  });

  test('returns a sorted list of emojis starting with query', () => {
    const list = getFilteredEmojis('go', {});
    expect(list).toEqual([
      { emoji_type: 'unicode', code: '1f3c1',  name: 'go' },
      { emoji_type: 'unicode', code: '1f945',  name: 'goal' },
      { emoji_type: 'unicode', code: '1f410',  name: 'goat' },
      { emoji_type: 'unicode', code: '1f47a',  name: 'goblin' },
      { emoji_type: 'unicode', code: '1f947',  name: 'gold' },
      { emoji_type: 'unicode', code: '1f4bd',  name: 'gold_record' },
      { emoji_type: 'unicode', code: '1f3cc',  name: 'golf' },
      { emoji_type: 'unicode', code: '1f6a0',  name: 'gondola' },
      { emoji_type: 'unicode', code: '1f31b',  name: 'goodnight' },
      { emoji_type: 'unicode', code: '1f945',  name: 'gooooooooal' },
      { emoji_type: 'unicode', code: '1f98d',  name: 'gorilla' },
      { emoji_type: 'unicode', code: '1f44c',  name: 'got_it' },
      { emoji_type: 'unicode', code: '1f616',  name: 'agony' },
      { emoji_type: 'unicode', code: '2705', name: 'all_good' },
      { emoji_type: 'unicode', code: '1f361', name: 'dango' },
      { emoji_type: 'unicode', code: '1f409', name: 'dragon' },
      { emoji_type: 'unicode', code: '1f432', name: 'dragon_face' },
      { emoji_type: 'unicode', code: '1f4b8', name: 'easy_come_easy_go' },
      { emoji_type: 'unicode', code: '1f49b', name: 'heart_of_gold' },
      { emoji_type: 'unicode', code: '1f3a0', name: 'merry_go_round' },
      { emoji_type: 'unicode', code: '1f6d1', name: 'octagonal_sign' },
      { emoji_type: 'unicode', code: '1f54d', name: 'synagogue' },
      { emoji_type: 'unicode', code: '264d', name: 'virgo' },
    ]);
  });

  test('returns literal emoji', () => {
    const list = getFilteredEmojis('🖤', {});
    expect(list).toEqual([
      { emoji_type: 'unicode', code: '1f5a4',  name: 'black_heart' },
    ]);
  });

  test('returns multiple literal emoji', () => {
    const list = getFilteredEmojis('👍', {});
    expect(list).toEqual([
      { emoji_type: 'unicode', code: '1f44d',  name: '+1' },
      { emoji_type: 'unicode', code: '1f44d',  name: 'thumbs_up' },
    ]);
  });

  test('search in realm emojis as well', () => {
    expect(
      getFilteredEmojis('qwerty', {
        qwerty: {
          code: '654',
          deactivated: false,
          name: 'qwerty',
          source_url: 'url',
        },
      }),
    ).toEqual([{ name: 'qwerty', emoji_type: 'image', code: '654' }]);
  });

  test('remove duplicates', () => {
    expect(getFilteredEmojis('dog', {})).toEqual([
      { emoji_type: 'unicode', code: '1f415', name: 'dog' },
      { emoji_type: 'unicode', code: '1f94b', name: 'dogi' },
      { emoji_type: 'unicode', code: '1f32d', name: 'hotdog' },
    ]);
    expect(
      getFilteredEmojis('dog', {
        dog: {
          code: '345',
          deactivated: false,
          name: 'dog',
          source_url: 'url',
        },
      }),
    ).toEqual([
      { emoji_type: 'image', code: '345', name: 'dog', },
      { emoji_type: 'unicode', code: '1f94b', name: 'dogi', },
      { emoji_type: 'unicode', code: '1f32d', name: 'hotdog' },
    ]);
  });
});
