import {
  homeNarrow,
  isHomeNarrow,
  privateNarrow,
  isPrivateNarrow,
  groupNarrow,
  isGroupNarrow,
  specialNarrow,
  isSpecialNarrow,
  streamNarrow,
  isStreamNarrow,
  topicNarrow,
  isTopicNarrow,
  searchNarrow,
  isSearchNarrow,
  isPrivateOrGroupNarrow,
  isMessageInNarrow,
  isStreamOrTopicNarrow,
  getNarrowFromMessage,
  validateNarrow,
} from '../narrow';

describe('homeNarrow', () => {
  test('produces an empty list', () => {
    expect(homeNarrow).toEqual([]);
  });

  test('empty list is a home narrow', () => {
    expect(isHomeNarrow([])).toBe(true);
    expect(isHomeNarrow([{}])).toBe(false);
  });
});

describe('privateNarrow', () => {
  test('produces an one item list, pm-with operator and single email', () => {
    expect(privateNarrow('bob@example.com')).toEqual([
      {
        operator: 'pm-with',
        operand: 'bob@example.com',
      },
    ]);
  });

  test('if operator is "pm-with" and only one email, then it is a private narrow', () => {
    expect(isPrivateNarrow([])).toBe(false);
    expect(isPrivateNarrow([{}, {}])).toBe(false);
    expect(
      isPrivateNarrow([
        {
          operator: 'pm-with',
          operand: 'bob@example.com',
        },
      ]),
    ).toBe(true);
  });
});

describe('groupNarrow', () => {
  test('returns a narrow with specified recipients', () => {
    expect(groupNarrow(['bob@example.com', 'john@example.com'])).toEqual([
      {
        operator: 'pm-with',
        operand: 'bob@example.com,john@example.com',
      },
    ]);
  });

  test('a group narrow is only private chat with more than one recipients', () => {
    expect(isGroupNarrow([])).toBe(false);
    expect(isGroupNarrow([{}, {}])).toBe(false);
    expect(
      isGroupNarrow([
        {
          operator: 'pm-with',
          operand: 'bob@example.com',
        },
      ]),
    ).toBe(false);
    expect(
      isGroupNarrow([
        {
          operator: 'pm-with',
          operand: 'bob@example.com,john@example.com',
        },
      ]),
    ).toBe(true);
  });
});

describe('isPrivateOrGroupNarrow', () => {
  test('a private or group narrow is any "pm-with" narrow', () => {
    expect(isPrivateOrGroupNarrow([])).toBe(false);
    expect(isPrivateOrGroupNarrow([{}, {}])).toBe(false);
    expect(
      isPrivateOrGroupNarrow([
        {
          operator: 'pm-with',
          operand: 'bob@example.com',
        },
      ]),
    ).toBe(true);
    expect(
      isPrivateOrGroupNarrow([
        {
          operator: 'pm-with',
          operand: 'bob@example.com,john@example.com',
        },
      ]),
    ).toBe(true);
  });
});

describe('isStreamOrTopicNarrow', () => {
  test('check for stream or topic narrow', () => {
    expect(isStreamOrTopicNarrow(streamNarrow('some stream'))).toBe(true);
    expect(isStreamOrTopicNarrow(topicNarrow('some stream', 'some topic'))).toBe(true);
    expect(isStreamOrTopicNarrow(homeNarrow)).toBe(false);
    expect(isStreamOrTopicNarrow(privateNarrow('a@a.com'))).toBe(false);
    expect(isStreamOrTopicNarrow(groupNarrow(['john@example.com', 'mark@example.com']))).toBe(
      false,
    );
    expect(isStreamOrTopicNarrow(specialNarrow('starred'))).toBe(false);
  });
});

describe('specialNarrow', () => {
  test('produces a narrow with "is" operator', () => {
    expect(specialNarrow('starred')).toEqual([
      {
        operator: 'is',
        operand: 'starred',
      },
    ]);
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
    expect(streamNarrow('some stream')).toEqual([
      {
        operator: 'stream',
        operand: 'some stream',
      },
    ]);
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
    expect(
      isTopicNarrow([
        {
          operator: 'stream',
          operand: 'some stream',
        },
        {
          operator: 'topic',
          operand: 'some topic',
        },
      ]),
    ).toBe(true);
  });
});

describe('searchNarrow', () => {
  test('produces a narrow for a search query', () => {
    expect(searchNarrow('some query')).toEqual([
      {
        operator: 'search',
        operand: 'some query',
      },
    ]);
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
    const narrow = homeNarrow;
    expect(isMessageInNarrow(message, narrow)).toBe(true);
  });

  test('message with type "private" is in private narrow if recipient matches', () => {
    const message = {
      type: 'private',
      display_recipient: [{ email: 'me@example.com' }, { email: 'john@example.com' }],
    };
    const narrow = privateNarrow('john@example.com');

    expect(isMessageInNarrow(message, narrow, 'me@example.com')).toBe(true);
  });

  test('message to self is in "private" narrow with self', () => {
    const message = {
      type: 'private',
      display_recipient: [{ email: 'me@example.com' }],
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
    const ownEmail = 'me@example.com';
    const narrow = groupNarrow(['john@example.com', 'mark@example.com']);

    expect(isMessageInNarrow(message, narrow, ownEmail)).toBe(true);
  });

  test('message with type "private" is always in "private messages" narrow', () => {
    const message = {
      type: 'private',
      display_recipient: [{ email: 'me@example.com' }, { email: 'john@example.com' }],
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

describe('getNarrowFromMessage', () => {
  test('message with single recipient, returns a private narrow', () => {
    const message = {
      display_recipient: [{ email: 'bob@example.com' }],
    };
    const auth = {
      email: 'hamlet@zulip.com',
    };
    const expectedNarrow = privateNarrow('bob@example.com');

    const actualNarrow = getNarrowFromMessage(message, auth.email);

    expect(actualNarrow).toEqual(expectedNarrow);
  });

  test('for message with multiple recipients, return a group narrow', () => {
    const message = {
      display_recipient: [{ email: 'bob@example.com' }, { email: 'john@example.com' }],
    };
    const auth = {
      email: 'hamlet@zulip.com',
    };
    const expectedNarrow = groupNarrow(['bob@example.com', 'john@example.com']);

    const actualNarrow = getNarrowFromMessage(message, auth.email);

    expect(actualNarrow).toEqual(expectedNarrow);
  });

  test('if recipient of a message is string, returns a stream narrow', () => {
    const message = {
      display_recipient: 'stream',
    };
    const expectedNarrow = streamNarrow('stream');

    const actualNarrow = getNarrowFromMessage(message);

    expect(actualNarrow).toEqual(expectedNarrow);
  });

  test('if recipient is a string and there is a subject returns a topic narrow', () => {
    const message = {
      display_recipient: 'stream',
      subject: 'subject',
    };
    const expectedNarrow = topicNarrow('stream', 'subject');

    const actualNarrow = getNarrowFromMessage(message);

    expect(actualNarrow).toEqual(expectedNarrow);
  });
});

describe('validateNarrow', () => {
  test('return true for narrow to valid stream/topic narrow, else false', () => {
    const streams = [
      {
        name: 'stream',
      },
    ];

    expect(validateNarrow(streamNarrow('stream'), streams, [])).toBe(true);
    expect(validateNarrow(streamNarrow('stream'), undefined, [])).toBe(false);
    expect(validateNarrow(streamNarrow('unknown stream'), streams, [])).toBe(false);
    expect(validateNarrow(streamNarrow('stream', 'topic'), streams, [])).toBe(true);
    expect(validateNarrow(topicNarrow('unknown stream', 'topic'), streams, [])).toBe(false);
  });

  test('return true for private narrow to non deactivated user, else false', () => {
    const users = [
      {
        email: 'a@a.com',
      },
      {
        email: 'b@a.com',
      },
      {
        email: 'c@a.com',
      },
    ];

    expect(validateNarrow(privateNarrow('a@a.com'), [], users)).toBe(true);
    expect(validateNarrow(privateNarrow('a@a.com'), [], undefined)).toBe(false);
    expect(validateNarrow(privateNarrow('z@a.com'), [], users)).toBe(false);
    expect(validateNarrow(groupNarrow(['a@a.com', 'b@a.com']), [], users)).toBe(true);
    expect(validateNarrow(groupNarrow(['x@z.com']), [], users)).toBe(false);
  });

  test('for home and special narrow return true', () => {
    expect(validateNarrow(specialNarrow('private'))).toBe(true);
    expect(validateNarrow(specialNarrow('mentions'))).toBe(true);
    expect(validateNarrow(homeNarrow)).toBe(true);
  });
});
