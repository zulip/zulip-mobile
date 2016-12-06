import {
  homeNarrow, isHomeNarrow,
  privateNarrow, isPrivateNarrow,
  groupNarrow, isGroupNarrow,
  specialNarrow, isSpecialNarrow,
  streamNarrow, isStreamNarrow,
  topicNarrow, isTopicNarrow,
  searchNarrow, isSearchNarrow,
} from '../narrow';

describe('homeNarrow', () => {
  test('produces an empty list', () => {
    expect(homeNarrow()).toEqual([]);
  });

  test('empty list is a home narrow', () => {
    expect(isHomeNarrow([])).toBe(true);
    expect(isHomeNarrow([{}])).toBe(false);
  });
});

describe('privateNarrow', () => {
  test('produces an one item list, pm-with operator and single email', () => {
    expect(privateNarrow('bob@example.com')).toEqual([{
      operator: 'pm-with',
      operand: 'bob@example.com'
    }]);
  });

  test('if operator is "pm-with" and only one email, then it is a private narrow', () => {
    expect(isPrivateNarrow([])).toBe(false);
    expect(isPrivateNarrow([{}, {}])).toBe(false);
    expect(isPrivateNarrow([{
      operator: 'pm-with',
      operand: 'bob@example.com',
    }])).toBe(true);
  });
});

describe('groupNarrow', () => {
  test('TODO', () => {
    expect(groupNarrow(['bob@example.com', 'john@example.com'])).toEqual([{
      operator: 'pm-with',
      operand: 'bob@example.com,john@example.com'
    }]);
  });

  test('TODO', () => {
    expect(isGroupNarrow([])).toBe(false);
    expect(isGroupNarrow([{}, {}])).toBe(false);
    expect(isGroupNarrow([{
      operator: 'pm-with',
      operand: 'bob@example.com',
    }])).toBe(false);
    expect(isGroupNarrow([{
      operator: 'pm-with',
      operand: 'bob@example.com,john@example.com',
    }])).toBe(true);
  });
});

describe('specialNarrow', () => {
  test('TODO', () => {
    expect(specialNarrow('starred')).toEqual([{
      operator: 'is',
      operand: 'starred',
    }]);
  });

  test('TODO', () => {
    expect(isSpecialNarrow([])).toBe(false);
    expect(isSearchNarrow([{}, {}])).toBe(false);
    expect(isSpecialNarrow([{ operator: 'stream', operand: 'some stream' }])).toBe(false);
    expect(isSpecialNarrow([{ operator: 'is', operand: 'starred' }])).toBe(true);
  });
});

describe('streamNarrow', () => {
  test('TODO', () => {
    expect(streamNarrow('some stream')).toEqual([{
      operator: 'stream',
      operand: 'some stream',
    }]);
  });

  test('TODO', () => {
    expect(isStreamNarrow([])).toBe(false);
    expect(isSearchNarrow([{}, {}])).toBe(false);
    expect(isStreamNarrow([{ operator: 'stream', operand: 'some stream' }])).toBe(true);
  });
});

describe('topicNarrow', () => {
  test('TODO', () => {
    expect(topicNarrow('some stream', 'some topic')).toEqual([
      { operator: 'stream', operand: 'some stream' },
      { operator: 'topic', operand: 'some topic' },
    ]);
  });

  test('TODO', () => {
    expect(isTopicNarrow([])).toBe(false);
    expect(isTopicNarrow([{}])).toBe(false);
    expect(isTopicNarrow([{
      operator: 'stream',
      operand: 'some stream',
    }, {
      operator: 'topic',
      operand: 'some topic',
    }])).toBe(true);
  });
});

describe('searchNarrow', () => {
  test('TODO', () => {
    expect(searchNarrow('some query')).toEqual([{
      operator: 'search',
      operand: 'some query',
    }]);
  });

  test('TODO', () => {
    expect(isSearchNarrow([])).toBe(false);
    expect(isSearchNarrow([{}, {}])).toBe(false);
    expect(isSearchNarrow([{ operator: 'search' }])).toBe(true);
  });
});
