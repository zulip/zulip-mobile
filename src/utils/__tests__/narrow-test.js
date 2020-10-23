/* @flow strict-local */

import {
  HOME_NARROW,
  isHomeNarrow,
  privateNarrow,
  isPrivateNarrow,
  groupNarrow,
  isGroupNarrow,
  specialNarrow,
  isSpecialNarrow,
  ALL_PRIVATE_NARROW,
  streamNarrow,
  isStreamNarrow,
  topicNarrow,
  isTopicNarrow,
  SEARCH_NARROW,
  isSearchNarrow,
  isPrivateOrGroupNarrow,
  isMessageInNarrow,
  isSameNarrow,
  isStreamOrTopicNarrow,
  getNarrowFromMessage,
  parseNarrowString,
  STARRED_NARROW,
  MENTIONED_NARROW,
} from '../narrow';

import * as eg from '../../__tests__/lib/exampleData';

describe('HOME_NARROW', () => {
  test('produces an empty list', () => {
    expect(HOME_NARROW).toEqual([]);
  });

  test('empty list is a home narrow', () => {
    expect(isHomeNarrow([])).toBe(true);
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
    expect(isPrivateNarrow(HOME_NARROW)).toBe(false);
    expect(isPrivateNarrow(privateNarrow('bob@example.com'))).toBe(true);
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
    expect(isGroupNarrow(HOME_NARROW)).toBe(false);
    expect(isGroupNarrow(privateNarrow('bob@example.com'))).toBe(false);
    expect(isGroupNarrow(groupNarrow(['bob@example.com', 'john@example.com']))).toBe(true);
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
    expect(isPrivateOrGroupNarrow(undefined)).toBe(false);
    expect(isPrivateOrGroupNarrow(HOME_NARROW)).toBe(false);
    expect(isPrivateOrGroupNarrow(privateNarrow('bob@example.com'))).toBe(true);
    expect(isPrivateOrGroupNarrow(groupNarrow(['bob@example.com', 'john@example.com']))).toBe(true);
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
    expect(isStreamOrTopicNarrow(undefined)).toBe(false);
    expect(isStreamOrTopicNarrow(streamNarrow('some stream'))).toBe(true);
    expect(isStreamOrTopicNarrow(topicNarrow('some stream', 'some topic'))).toBe(true);
    expect(isStreamOrTopicNarrow(HOME_NARROW)).toBe(false);
    expect(isStreamOrTopicNarrow(privateNarrow('a@a.com'))).toBe(false);
    expect(isStreamOrTopicNarrow(groupNarrow(['john@example.com', 'mark@example.com']))).toBe(
      false,
    );
    expect(isStreamOrTopicNarrow(STARRED_NARROW)).toBe(false);
  });
});

describe('specialNarrow', () => {
  test('produces a narrow with "is" operator', () => {
    expect(STARRED_NARROW).toEqual([
      {
        operator: 'is',
        operand: 'starred',
      },
    ]);
  });

  test('only narrowing with the "is" operator is special narrow', () => {
    expect(isSpecialNarrow(undefined)).toBe(false);
    expect(isSpecialNarrow(HOME_NARROW)).toBe(false);
    expect(isSpecialNarrow(streamNarrow('some stream'))).toBe(false);
    expect(isSpecialNarrow(STARRED_NARROW)).toBe(true);
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
    expect(isStreamNarrow(undefined)).toBe(false);
    expect(isStreamNarrow(HOME_NARROW)).toBe(false);
    expect(isStreamNarrow(streamNarrow('some stream'))).toBe(true);
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
    expect(isTopicNarrow(undefined)).toBe(false);
    expect(isTopicNarrow(HOME_NARROW)).toBe(false);
    expect(isTopicNarrow(topicNarrow('some stream', 'some topic'))).toBe(true);
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

describe('SEARCH_NARROW', () => {
  test('produces a narrow for a search query', () => {
    expect(SEARCH_NARROW('some query')).toEqual([
      {
        operator: 'search',
        operand: 'some query',
      },
    ]);
  });

  test('narrow with "search" operand is a search narrow', () => {
    expect(isSearchNarrow(undefined)).toBe(false);
    expect(isSearchNarrow(HOME_NARROW)).toBe(false);
    expect(isSearchNarrow(SEARCH_NARROW('some query'))).toBe(true);
  });
});

describe('isMessageInNarrow', () => {
  const ownEmail = eg.selfUser.email;

  test('any message is in "Home"', () => {
    const message = eg.streamMessage({ flags: [] });
    const narrow = HOME_NARROW;
    expect(isMessageInNarrow(message, narrow, ownEmail)).toBe(true);
  });

  test('message with type "private" is in private narrow if recipient matches', () => {
    const message = eg.pmMessage({ flags: [] });
    const narrow = privateNarrow(eg.otherUser.email);
    expect(isMessageInNarrow(message, narrow, ownEmail)).toBe(true);
  });

  test('message to self is in "private" narrow with self', () => {
    const message = eg.pmMessage({
      flags: [],
      display_recipient: [eg.displayRecipientFromUser(eg.selfUser)],
    });
    const narrow = privateNarrow(eg.selfUser.email);
    expect(isMessageInNarrow(message, narrow, ownEmail)).toBe(true);
  });

  test('message with type "private" is in group narrow if all recipients match ', () => {
    const message = eg.pmMessage({
      flags: [],
      display_recipient: [eg.selfUser, eg.otherUser, eg.thirdUser].map(eg.displayRecipientFromUser),
    });
    const narrow = groupNarrow([eg.otherUser.email, eg.thirdUser.email]);
    expect(isMessageInNarrow(message, narrow, ownEmail)).toBe(true);
  });

  test('message with type "private" is always in "private messages" narrow', () => {
    const message = eg.pmMessage({
      flags: [],
      display_recipient: [eg.selfUser, eg.otherUser].map(eg.displayRecipientFromUser),
    });
    expect(isMessageInNarrow(message, ALL_PRIVATE_NARROW, ownEmail)).toBe(true);
  });

  test('message with type "stream" is in narrow if recipient and current stream match', () => {
    const message = eg.streamMessage({
      flags: [],
    });
    const narrow = streamNarrow(eg.stream.name);
    expect(isMessageInNarrow(message, narrow, ownEmail)).toBe(true);
  });

  test('message with flags absent throws an error', () => {
    const message = eg.streamMessage({
      // no flags
    });
    expect(() => isMessageInNarrow(message, MENTIONED_NARROW, ownEmail)).toThrow();
  });

  test('message with flag "mentioned" is in is:mentioned narrow', () => {
    const message = eg.streamMessage({
      flags: ['mentioned'],
    });
    expect(isMessageInNarrow(message, MENTIONED_NARROW, ownEmail)).toBe(true);
  });

  test('message with flag "wildcard_mentioned" is in is:mentioned narrow', () => {
    const message = eg.streamMessage({
      flags: ['wildcard_mentioned'],
    });
    expect(isMessageInNarrow(message, MENTIONED_NARROW, ownEmail)).toBe(true);
  });

  test('message without flag "mentioned" or "wildcard_mentioned" is not in is:mentioned narrow', () => {
    const message = eg.streamMessage({
      flags: [],
    });
    expect(isMessageInNarrow(message, MENTIONED_NARROW, ownEmail)).toBe(false);
  });

  test('message with flag "starred" is in is:starred narrow', () => {
    const message = eg.streamMessage({
      flags: ['starred'],
    });
    expect(isMessageInNarrow(message, STARRED_NARROW, ownEmail)).toBe(true);
  });

  test('message without flag "starred" is not in is:starred narrow', () => {
    const message = eg.streamMessage({
      flags: [],
    });
    expect(isMessageInNarrow(message, STARRED_NARROW, ownEmail)).toBe(false);
  });

  test('message with type stream is in topic narrow if current stream and topic match with its own', () => {
    const message = eg.streamMessage({
      flags: [],
    });
    const narrow = topicNarrow(eg.stream.name, message.subject);
    expect(isMessageInNarrow(message, narrow, ownEmail)).toBe(true);
  });
});

describe('getNarrowFromMessage', () => {
  const ownEmail = eg.selfUser.email;

  test('message with single recipient, returns a private narrow', () => {
    const message = eg.pmMessage({
      display_recipient: [eg.displayRecipientFromUser(eg.otherUser)],
    });
    const expectedNarrow = privateNarrow(eg.otherUser.email);

    const actualNarrow = getNarrowFromMessage(message, ownEmail);

    expect(actualNarrow).toEqual(expectedNarrow);
  });

  test('for message with multiple recipients, return a group narrow', () => {
    const message = eg.pmMessage({
      display_recipient: [eg.otherUser, eg.thirdUser].map(eg.displayRecipientFromUser),
    });
    const expectedNarrow = groupNarrow([eg.otherUser.email, eg.thirdUser.email]);

    const actualNarrow = getNarrowFromMessage(message, ownEmail);

    expect(actualNarrow).toEqual(expectedNarrow);
  });

  test('if recipient of a message is string, returns a stream narrow', () => {
    const message = eg.streamMessage({ subject: '' });
    const expectedNarrow = streamNarrow(eg.stream.name);

    const actualNarrow = getNarrowFromMessage(message, ownEmail);

    expect(actualNarrow).toEqual(expectedNarrow);
  });

  test('if recipient is a string and there is a subject returns a topic narrow', () => {
    const message = eg.streamMessage();
    const expectedNarrow = topicNarrow(eg.stream.name, message.subject);

    const actualNarrow = getNarrowFromMessage(message, ownEmail);

    expect(actualNarrow).toEqual(expectedNarrow);
  });
});

describe('isSameNarrow', () => {
  test('Return true if two narrows are same', () => {
    expect(isSameNarrow(streamNarrow('stream'), streamNarrow('stream'))).toBe(true);
    expect(isSameNarrow(streamNarrow('stream'), streamNarrow('stream1'))).toBe(false);
    expect(isSameNarrow(streamNarrow('stream'), topicNarrow('stream', 'topic'))).toBe(false);
    expect(isSameNarrow(topicNarrow('stream', 'topic'), topicNarrow('stream', 'topic'))).toBe(true);
    expect(isSameNarrow(topicNarrow('stream', 'topic'), topicNarrow('stream', 'topic1'))).toBe(
      false,
    );
    expect(isSameNarrow(HOME_NARROW, specialNarrow('private'))).toBe(false);
    expect(isSameNarrow(HOME_NARROW, HOME_NARROW)).toBe(true);
  });
});

describe('parseNarrowString', () => {
  test('straightforward arrays are parsed', () => {
    expect(parseNarrowString('[]')).toEqual([]);
    expect(parseNarrowString('[{&quot;operator&quot;:&quot;hey&quot;}]')).toEqual([
      { operator: 'hey' },
    ]);
  });
});
