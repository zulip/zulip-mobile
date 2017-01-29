import {
  homeNarrow, isHomeNarrow,
  privateNarrow, isPrivateNarrow,
  groupNarrow, isGroupNarrow,
  specialNarrow, isSpecialNarrow,
  streamNarrow, isStreamNarrow,
  topicNarrow, isTopicNarrow,
  searchNarrow, isSearchNarrow,
  isMessageInNarrow,
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
  test('returns a narrow with specified recipients', () => {
    expect(groupNarrow(['bob@example.com', 'john@example.com'])).toEqual([{
      operator: 'pm-with',
      operand: 'bob@example.com,john@example.com'
    }]);
  });

  test('a group narrow is only private chat with more than one recipients', () => {
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
  test('produces a narrow with "is" operator', () => {
    expect(specialNarrow('starred')).toEqual([{
      operator: 'is',
      operand: 'starred',
    }]);
  });

  test('only narrowing with the "is" operator is special narrow', () => {
    expect(isSpecialNarrow([])).toBe(false);
    expect(isSearchNarrow([{}, {}])).toBe(false);
    expect(isSpecialNarrow([{ operator: 'stream', operand: 'some stream' }])).toBe(false);
    expect(isSpecialNarrow([{ operator: 'is', operand: 'starred' }])).toBe(true);
  });
});

describe('streamNarrow', () => {
  test('narrows to messages from a specific stream', () => {
    expect(streamNarrow('some stream')).toEqual([{
      operator: 'stream',
      operand: 'some stream',
    }]);
  });

  test('only narrow with operator of "stream" is a stream narrow', () => {
    expect(isStreamNarrow([])).toBe(false);
    expect(isSearchNarrow([{}, {}])).toBe(false);
    expect(isStreamNarrow([{ operator: 'stream', operand: 'some stream' }])).toBe(true);
  });
});

describe('topicNarrow', () => {
  test('narrows to a specific topic within a specified stream', () => {
    expect(topicNarrow('some stream', 'some topic')).toEqual([
      { operator: 'stream', operand: 'some stream' },
      { operator: 'topic', operand: 'some topic' },
    ]);
  });

  test('only narrow with two items, one for stream, one for topic is a topic narrow', () => {
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
  test('produces a narrow for a search query', () => {
    expect(searchNarrow('some query')).toEqual([{
      operator: 'search',
      operand: 'some query',
    }]);
  });

  test('narrow with "search" operand is a search narrow', () => {
    expect(isSearchNarrow([])).toBe(false);
    expect(isSearchNarrow([{}, {}])).toBe(false);
    expect(isSearchNarrow([{ operator: 'search' }])).toBe(true);
  });
});

describe('isMessageInNarrow', () => {
  test('any message is in "Home"', () => {
    const message = {};
    const narrow = homeNarrow();
    expect(isMessageInNarrow(message, narrow)).toBe(true);
  });

  test('message with type "private" is in private narrow if recipient matches', () => {
    const message = {
      type: 'private',
      display_recipient: [
        { email: 'me@example.com' },
        { email: 'john@example.com' },
      ],
    };
    const narrow = privateNarrow('john@example.com');

    expect(isMessageInNarrow(message, narrow, 'me@example.com')).toBe(true);
  });

  test('message to self is in "private" narrow with self', () => {
    const message = {
      type: 'private',
      display_recipient: [
        { email: 'me@example.com' },
      ],
    };
    const narrow = privateNarrow('me@example.com');

    expect(isMessageInNarrow(message, narrow, 'me@example.com')).toBe(true);
  });

  test('message with type "private" is in group narrow if all recipients match ', () => {
    const message = {
      type: 'private',
      display_recipient: [
        { email: 'me@example.com' },
        { email: 'john@example.com' },
        { email: 'mark@example.com' },
      ],
    };
    const selfEmail = 'me@example.com';
    const narrow = groupNarrow(['john@example.com', 'mark@example.com']);

    expect(isMessageInNarrow(message, narrow, selfEmail)).toBe(true);
  });

  test('message with type "private" is always in "private messages" narrow', () => {
    const message = {
      type: 'private',
      display_recipient: [
        { email: 'me@example.com' },
        { email: 'john@example.com' },
      ],
    };
    const narrow = specialNarrow('private', 'some topic');

    expect(isMessageInNarrow(message, narrow)).toBe(true);
  });

  test('message with type "stream" is in narrow if recipient and current stream match', () => {
    const message = {
      type: 'stream',
      display_recipient: 'some stream',
    };
    const narrow = streamNarrow('some stream');

    expect(isMessageInNarrow(message, narrow)).toBe(true);
  });

  test('message with type stream is in topic narrow if current stream and topic match with its own', () => {
    const message = {
      type: 'stream',
      subject: 'some topic',
      display_recipient: 'some stream',
    };
    const narrow = topicNarrow('some stream', 'some topic');

    expect(isMessageInNarrow(message, narrow)).toBe(true);
  });
});
