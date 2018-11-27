import { getFilteredEmojiNames } from '../data';

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
