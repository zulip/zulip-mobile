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
  const otherStream = eg.makeStream();

  // prettier-ignore
  for (const [narrowDescription, narrow, cases] of [
    ['all-messages ("home") narrow', HOME_NARROW, [
      ['a message', true, eg.streamMessage()],
    ]],

    ['whole-stream narrow', streamNarrow(eg.stream.name), [
      ['matching stream message', true, eg.streamMessage()],
      ['other-stream message', false, eg.streamMessage({ stream: otherStream })],
      ['PM', false, eg.pmMessage()],
    ]],
    ['stream conversation', topicNarrow(eg.stream.name, 'cabbages'), [
      ['matching message', true, eg.streamMessage({ subject: 'cabbages' })],
      ['message in same stream but other topic', false, eg.streamMessage({ subject: 'kings' })],
      ['other-stream message', false, eg.streamMessage({ stream: otherStream })],
      ['PM', false, eg.pmMessage()],
    ]],

    ['1:1 PM conversation, non-self', privateNarrow(eg.otherUser.email), [
      ['matching PM, inbound', true, eg.pmMessage()],
      ['matching PM, outbound', true, eg.pmMessage({ sender: eg.selfUser })],
      ['self-1:1 message', false, eg.pmMessage({ sender: eg.selfUser, recipients: [eg.selfUser] })],
      ['group-PM including this user, inbound', false, eg.pmMessage({ recipients: [eg.selfUser, eg.otherUser, eg.thirdUser] })],
      ['group-PM including this user, outbound', false, eg.pmMessage({ sender: eg.selfUser, recipients: [eg.selfUser, eg.otherUser, eg.thirdUser] })],
      ['stream message', false, eg.streamMessage()],
    ]],
    ['self-1:1 conversation', privateNarrow(eg.selfUser.email), [
      ['self-1:1 message', true, eg.pmMessage({ sender: eg.selfUser, recipients: [eg.selfUser] })],
      ['other 1:1 message, inbound', false, eg.pmMessage()],
      ['other 1:1 message, outbound', false, eg.pmMessage({ sender: eg.selfUser })],
      ['group-PM, inbound', false, eg.pmMessage({ recipients: [eg.selfUser, eg.otherUser, eg.thirdUser] })],
      ['group-PM, outbound', false, eg.pmMessage({ sender: eg.selfUser, recipients: [eg.selfUser, eg.otherUser, eg.thirdUser] })],
      ['stream message', false, eg.streamMessage()],
    ]],
    ['group-PM conversation', groupNarrow([eg.otherUser.email, eg.thirdUser.email]), [
      ['matching group-PM, inbound', true, eg.pmMessage({ recipients: [eg.selfUser, eg.otherUser, eg.thirdUser] })],
      ['matching group-PM, outbound', true, eg.pmMessage({ sender: eg.selfUser, recipients: [eg.selfUser, eg.otherUser, eg.thirdUser] })],
      ['1:1 within group, inbound', false, eg.pmMessage()],
      ['1:1 within group, outbound', false, eg.pmMessage({ sender: eg.selfUser })],
      ['self-1:1 message', false, eg.pmMessage({ sender: eg.selfUser, recipients: [eg.selfUser] })],
      ['stream message', false, eg.streamMessage()],
    ]],
    ['group-PM conversation, including self', groupNarrow([eg.selfUser.email, eg.otherUser.email, eg.thirdUser.email]), [
      ['matching group-PM, inbound', true, eg.pmMessage({ recipients: [eg.selfUser, eg.otherUser, eg.thirdUser] })],
      ['matching group-PM, outbound', true, eg.pmMessage({ sender: eg.selfUser, recipients: [eg.selfUser, eg.otherUser, eg.thirdUser] })],
      ['1:1 within group, inbound', false, eg.pmMessage()],
      ['1:1 within group, outbound', false, eg.pmMessage({ sender: eg.selfUser })],
      ['self-1:1 message', false, eg.pmMessage({ sender: eg.selfUser, recipients: [eg.selfUser] })],
      ['stream message', false, eg.streamMessage()],
    ]],
    ['all-PMs narrow', ALL_PRIVATE_NARROW, [
      ['a PM', true, eg.pmMessage()],
      ['stream message', false, eg.streamMessage()],
    ]],

    ['is:mentioned', MENTIONED_NARROW, [
      ['w/ mentioned flag', true, eg.streamMessage({ flags: ['mentioned'] })],
      ['w/ wildcard_mentioned flag', true, eg.streamMessage({ flags: ['wildcard_mentioned'] })],
      ['w/o flags', false, eg.streamMessage()],
    ]],
    ['is:starred', STARRED_NARROW, [
      ['w/ starred flag', true, eg.streamMessage({ flags: ['starred'] })],
      ['w/o flags', false, eg.streamMessage()],
    ]],
  ]) {
    describe(narrowDescription, () => {
      for (const [messageDescription, expected, message] of cases) {
        test(`${expected ? 'contains' : 'excludes'} ${messageDescription}`, () => {
          expect(
            isMessageInNarrow(message, message.flags ?? [], narrow, ownEmail),
          ).toBe(expected);
        });
      }
    });
  }
});

describe('getNarrowFromMessage', () => {
  const ownEmail = eg.selfUser.email;

  test('for self-PM, returns self-1:1 narrow', () => {
    expect(
      getNarrowFromMessage(
        eg.pmMessage({ sender: eg.selfUser, recipients: [eg.selfUser] }),
        ownEmail,
      ),
    ).toEqual(privateNarrow(eg.selfUser.email));
  });

  test('for 1:1 PM, returns a 1:1 PM narrow', () => {
    const message = eg.pmMessage();
    const expectedNarrow = privateNarrow(eg.otherUser.email);

    const actualNarrow = getNarrowFromMessage(message, ownEmail);

    expect(actualNarrow).toEqual(expectedNarrow);
  });

  test('for group PM, returns a group PM narrow', () => {
    const message = eg.pmMessage({
      recipients: [eg.selfUser, eg.otherUser, eg.thirdUser],
    });
    const expectedNarrow = groupNarrow([eg.otherUser.email, eg.thirdUser.email]);

    const actualNarrow = getNarrowFromMessage(message, ownEmail);

    expect(actualNarrow).toEqual(expectedNarrow);
  });

  test('for stream message with empty topic, returns a stream narrow', () => {
    // TODO this behavior seems pretty dubious
    const message = eg.streamMessage({ subject: '' });
    const expectedNarrow = streamNarrow(eg.stream.name);

    const actualNarrow = getNarrowFromMessage(message, ownEmail);

    expect(actualNarrow).toEqual(expectedNarrow);
  });

  test('for stream message with nonempty topic, returns a topic narrow', () => {
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
