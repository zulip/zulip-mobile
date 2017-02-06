import getFilteredEmojiList from '../getFilteredEmojiList';

describe('getFilteredEmojiList', () => {
  test('empty query returns all emojis', () => {
    const list = getFilteredEmojiList('');
    expect(list.length).toEqual(1391);
  });

  test('non existing query returns empty list', () => {
    const list = getFilteredEmojiList('qwerty');
    expect(list.length).toEqual(0);
  });

  test('returns a sorted list of emojis starting with query', () => {
    const list = getFilteredEmojiList('go');
    expect(list).toEqual(['goat', 'goblin', 'golf', 'golfer']);
  });
});
