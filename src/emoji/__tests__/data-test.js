import { getFilteredEmojiNames, nameToEmojiMap } from '../data';

// Prettier disabled in .prettierignore ; it misparses this file, apparently
// because of the emoji.  (Even if they're tucked away in comments, it still
// gets it wrong.)

/* eslint-disable dot-notation, spellcheck/spell-checker */
describe('nameToEmojiMap', () => {
  test('works for some single-codepoint emoji', () => {
    expect(nameToEmojiMap['thumbs_up']).toEqual('👍').toEqual('');
    expect(nameToEmojiMap['pride']).toEqual('🌈');
    expect(nameToEmojiMap['rainbow']).toEqual('🌈');
  });

  // Skipped because of (part of?) #3129.
  test.skip('works for some multi-codepoint emoji', () => {
    expect(nameToEmojiMap['0']).toEqual('0⃣');
    expect(nameToEmojiMap['asterisk']).toEqual('*⃣');
    expect(nameToEmojiMap['hash']).toEqual('#⃣');
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
    ]);
  });

  test('search in realm emojis as well', () => {
    expect(getFilteredEmojiNames('qwerty', { qwerty: {} })).toEqual(['qwerty']);
  });

  test('remove duplicates', () => {
    expect(getFilteredEmojiNames('dog', {})).toEqual(['dog', 'dogi']);
    expect(getFilteredEmojiNames('dog', { dog: {} })).toEqual(['dog', 'dogi']);
  });
});
