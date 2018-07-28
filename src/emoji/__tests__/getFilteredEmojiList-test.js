import getFilteredEmojiList from '../getFilteredEmojiList';

describe('getFilteredEmojiList', () => {
  test('empty query returns all emojis', () => {
    const list = getFilteredEmojiList('', {});
    expect(list).toHaveLength(1479);
  });

  test('non existing query returns empty list', () => {
    const list = getFilteredEmojiList('qwerty', {});
    expect(list).toHaveLength(0);
  });

  test('returns a sorted list of emojis starting with query', () => {
    const list = getFilteredEmojiList('go', {});
    expect(list).toEqual(['goal_net', 'goat', 'goblin', 'golf', 'golfer', 'gorilla']);
  });

  // skip: #2846
  test.skip('search in realm emojis as well', () => {
    const list = getFilteredEmojiList('don', {
      done: { source_url: '/user_avatars/2/emoji/done.png' },
    });
    expect(list).toEqual(['done']);
  });

  test('remove duplicates', () => {
    const list = getFilteredEmojiList('dog', {
      dog: { source_url: '/user_avatars/2/emoji/dog.png' },
    });
    expect(list).toEqual(['dog', 'dog2', 'dog_face']);
  });

  // skip: #2846
  test.skip('return realm emojis which includes filter ', () => {
    const list = getFilteredEmojiList('all', {
      small: { source_url: '/user_avatars/2/emoji/small.png' },
    });
    expect(list).toEqual(['small']);
  });
});
