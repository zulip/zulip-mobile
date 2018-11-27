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

  // skip: #2846
  test.skip('search in realm emojis as well', () => {
    const list = getFilteredEmojiNames('don', {
      done: { source_url: '/user_avatars/2/emoji/done.png' },
    });
    expect(list).toEqual(['done']);
  });

  test('remove duplicates', () => {
    const list = getFilteredEmojiNames('dog', {
      dog: { source_url: '/user_avatars/2/emoji/dog.png' },
    });
    expect(list).toEqual(['dog', 'dogi']);
  });
});
