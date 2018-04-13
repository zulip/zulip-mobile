import getFilteredEmojiList from '../getFilteredEmojiList';

describe('getFilteredEmojiList', () => {
  test('empty query returns all emojis', () => {
    const list = getFilteredEmojiList('', {});
    expect(list.length).toEqual(1391);
  });

  test('non existing query returns empty list', () => {
    const list = getFilteredEmojiList('qwerty', {});
    expect(list.length).toEqual(0);
  });

  test('returns a sorted list of emojis starting with query', () => {
    const list = getFilteredEmojiList('go', {});
    expect(list).toEqual(['goat', 'goblin', 'golf', 'golfer']);
  });

  test('search in realm emojis as well', () => {
    const list = getFilteredEmojiList('don', {
      1: { name: 'done', source_url: '/user_avatars/2/emoji/done.png' },
    });
    expect(list).toEqual(['done']);
  });

  test('remove duplicates', () => {
    const list = getFilteredEmojiList('dog', {
      2: { name: 'dog', source_url: '/user_avatars/2/emoji/dog.png' },
    });
    expect(list).toEqual(['dog', 'dog2', 'dog_face']);
  });

  test('return realm emojis which includes filter', () => {
    const list = getFilteredEmojiList('all', {
      3: { name: 'small', source_url: '/user_avatars/2/emoji/small.png' },
    });
    expect(list).toEqual(['small']);
  });

  test('return realm emojis in order of which starts with and then which includes query', () => {
    const list = getFilteredEmojiList('all', {
      3: { name: 'small', source_url: '/user_avatars/2/emoji/small.png' },
      4: { name: 'all', source_url: '/user_avatars/2/emoji/all.png' },
    });
    expect(list).toEqual(['all', 'small']);
  });
});
