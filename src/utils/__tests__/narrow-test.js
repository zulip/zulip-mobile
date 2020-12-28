/* @flow strict-local */

import {
  HOME_NARROW,
  isHomeNarrow,
  pm1to1NarrowFromUser,
  is1to1PmNarrow,
  pmNarrowFromUsersUnsafe,
  isSpecialNarrow,
  ALL_PRIVATE_NARROW,
  streamNarrow,
  isStreamNarrow,
  topicNarrow,
  isTopicNarrow,
  SEARCH_NARROW,
  isSearchNarrow,
  isPmNarrow,
  isMessageInNarrow,
  isStreamOrTopicNarrow,
  getNarrowsForMessage,
  getNarrowForReply,
  parseNarrow,
  STARRED_NARROW,
  MENTIONED_NARROW,
  keyFromNarrow,
  streamNameOfNarrow,
  topicOfNarrow,
  emailOfPm1to1Narrow,
} from '../narrow';
import type { Narrow, Message } from '../../types';
import * as eg from '../../__tests__/lib/exampleData';

describe('HOME_NARROW', () => {
  test('is a home narrow', () => {
    expect(isHomeNarrow(HOME_NARROW)).toBe(true);
  });
});

describe('pm1to1NarrowFromUser', () => {
  test('produces a 1:1 narrow', () => {
    const narrow = pm1to1NarrowFromUser(eg.otherUser);
    expect(is1to1PmNarrow(narrow)).toBeTrue();
    expect(emailOfPm1to1Narrow(narrow)).toEqual(eg.otherUser.email);
  });

  test('if operator is "pm-with" and only one email, then it is a private narrow', () => {
    expect(is1to1PmNarrow(HOME_NARROW)).toBe(false);
    expect(is1to1PmNarrow(pm1to1NarrowFromUser(eg.otherUser))).toBe(true);
  });
});

describe('isPmNarrow', () => {
  test('a private or group narrow is any "pm-with" narrow', () => {
    expect(isPmNarrow(undefined)).toBe(false);
    expect(isPmNarrow(HOME_NARROW)).toBe(false);
    expect(isPmNarrow(pm1to1NarrowFromUser(eg.otherUser))).toBe(true);
    expect(isPmNarrow(pmNarrowFromUsersUnsafe([eg.otherUser, eg.thirdUser]))).toBe(true);
  });
});

describe('isStreamOrTopicNarrow', () => {
  test('check for stream or topic narrow', () => {
    expect(isStreamOrTopicNarrow(undefined)).toBe(false);
    expect(isStreamOrTopicNarrow(streamNarrow('some stream'))).toBe(true);
    expect(isStreamOrTopicNarrow(topicNarrow('some stream', 'some topic'))).toBe(true);
    expect(isStreamOrTopicNarrow(HOME_NARROW)).toBe(false);
    expect(isStreamOrTopicNarrow(pm1to1NarrowFromUser(eg.otherUser))).toBe(false);
    expect(isStreamOrTopicNarrow(pmNarrowFromUsersUnsafe([eg.otherUser, eg.thirdUser]))).toBe(
      false,
    );
    expect(isStreamOrTopicNarrow(STARRED_NARROW)).toBe(false);
  });
});

describe('specialNarrow', () => {
  test('only narrowing with the "is" operator is special narrow', () => {
    expect(isSpecialNarrow(undefined)).toBe(false);
    expect(isSpecialNarrow(HOME_NARROW)).toBe(false);
    expect(isSpecialNarrow(streamNarrow('some stream'))).toBe(false);
    expect(isSpecialNarrow(STARRED_NARROW)).toBe(true);
  });
});

describe('streamNarrow', () => {
  test('narrows to messages from a specific stream', () => {
    const narrow = streamNarrow('some stream');
    expect(isStreamNarrow(narrow)).toBeTrue();
    expect(streamNameOfNarrow(narrow)).toEqual('some stream');
  });

  test('only narrow with operator of "stream" is a stream narrow', () => {
    expect(isStreamNarrow(undefined)).toBe(false);
    expect(isStreamNarrow(HOME_NARROW)).toBe(false);
    expect(isStreamNarrow(streamNarrow('some stream'))).toBe(true);
  });
});

describe('topicNarrow', () => {
  test('narrows to a specific topic within a specified stream', () => {
    const narrow = topicNarrow('some stream', 'some topic');
    expect(isTopicNarrow(narrow)).toBeTrue();
    expect(streamNameOfNarrow(narrow)).toEqual('some stream');
    expect(topicOfNarrow(narrow)).toEqual('some topic');
  });

  test('only narrow with two items, one for stream, one for topic is a topic narrow', () => {
    expect(isTopicNarrow(undefined)).toBe(false);
    expect(isTopicNarrow(HOME_NARROW)).toBe(false);
    expect(isTopicNarrow(topicNarrow('some stream', 'some topic'))).toBe(true);
  });
});

describe('SEARCH_NARROW', () => {
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

    ['1:1 PM conversation, non-self', pm1to1NarrowFromUser(eg.otherUser), [
      ['matching PM, inbound', true, eg.pmMessage()],
      ['matching PM, outbound', true, eg.pmMessage({ sender: eg.selfUser })],
      ['self-1:1 message', false, eg.pmMessage({ sender: eg.selfUser, recipients: [eg.selfUser] })],
      ['group-PM including this user, inbound', false, eg.pmMessage({ recipients: [eg.selfUser, eg.otherUser, eg.thirdUser] })],
      ['group-PM including this user, outbound', false, eg.pmMessage({ sender: eg.selfUser, recipients: [eg.selfUser, eg.otherUser, eg.thirdUser] })],
      ['stream message', false, eg.streamMessage()],
    ]],
    ['self-1:1 conversation', pm1to1NarrowFromUser(eg.selfUser), [
      ['self-1:1 message', true, eg.pmMessage({ sender: eg.selfUser, recipients: [eg.selfUser] })],
      ['other 1:1 message, inbound', false, eg.pmMessage()],
      ['other 1:1 message, outbound', false, eg.pmMessage({ sender: eg.selfUser })],
      ['group-PM, inbound', false, eg.pmMessage({ recipients: [eg.selfUser, eg.otherUser, eg.thirdUser] })],
      ['group-PM, outbound', false, eg.pmMessage({ sender: eg.selfUser, recipients: [eg.selfUser, eg.otherUser, eg.thirdUser] })],
      ['stream message', false, eg.streamMessage()],
    ]],
    ['group-PM conversation', pmNarrowFromUsersUnsafe([eg.otherUser, eg.thirdUser]), [
      ['matching group-PM, inbound', true, eg.pmMessage({ recipients: [eg.selfUser, eg.otherUser, eg.thirdUser] })],
      ['matching group-PM, outbound', true, eg.pmMessage({ sender: eg.selfUser, recipients: [eg.selfUser, eg.otherUser, eg.thirdUser] })],
      ['1:1 within group, inbound', false, eg.pmMessage()],
      ['1:1 within group, outbound', false, eg.pmMessage({ sender: eg.selfUser })],
      ['self-1:1 message', false, eg.pmMessage({ sender: eg.selfUser, recipients: [eg.selfUser] })],
      ['stream message', false, eg.streamMessage()],
    ]],
    ['group-PM conversation, including self', pmNarrowFromUsersUnsafe([eg.selfUser, eg.otherUser, eg.thirdUser]), [
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

describe('getNarrowsForMessage', () => {
  /**
   * Helper function that tests one Message.
   *
   * In addition to the expected output the case declares, also expect
   * MENTIONED_NARROW or STARRED_NARROW if those flags are present.
   */
  // Tell ESLint to recognize `checkCase` as a helper function that
  // runs assertions.
  /* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkCase"] }] */
  const checkCase = (c: {| label: string, message: Message, expectedNarrows: Narrow[] |}) => {
    test(`${c.label}; no flags`, () => {
      expect(getNarrowsForMessage(c.message, eg.selfUser, [])).toIncludeSameMembers(
        c.expectedNarrows,
      );
    });

    test(`${c.label}; starred`, () => {
      expect(getNarrowsForMessage(c.message, eg.selfUser, ['starred'])).toIncludeSameMembers([
        ...c.expectedNarrows,
        STARRED_NARROW,
      ]);
    });

    test(`${c.label}; mentioned`, () => {
      expect(getNarrowsForMessage(c.message, eg.selfUser, ['mentioned'])).toIncludeSameMembers([
        ...c.expectedNarrows,
        MENTIONED_NARROW,
      ]);
    });

    test(`${c.label}; wildcard_mentioned`, () => {
      expect(getNarrowsForMessage(c.message, eg.selfUser, ['mentioned'])).toIncludeSameMembers([
        ...c.expectedNarrows,
        MENTIONED_NARROW,
      ]);
    });

    test(`${c.label}; starred, mentioned, and wildcard_mentioned`, () => {
      expect(
        getNarrowsForMessage(c.message, eg.selfUser, [
          'starred',
          'mentioned',
          'wildcard_mentioned',
        ]),
      ).toIncludeSameMembers([...c.expectedNarrows, STARRED_NARROW, MENTIONED_NARROW]);
    });
  };

  const cases = [
    {
      label: "Message in stream 'myStream' with topic 'myTopic'",
      message: {
        ...eg.streamMessage({ stream: eg.makeStream({ name: 'myStream' }) }),
        subject: 'myTopic',
      },
      expectedNarrows: [HOME_NARROW, streamNarrow('myStream'), topicNarrow('myStream', 'myTopic')],
    },
    {
      // If we find that `subject` is sometimes the empty string and
      // that needs to be treated as a special case, this case should
      // be edited.
      //
      // It's not currently clear that we'd ever get a stream message
      // with the empty string for `subject` from the server.
      //
      // We don't store outbox messages with the empty string for
      // `subject`; if the topic input is left blank, we put down
      // '(no topic)' for `subject`.
      label: "Message in stream 'myStream' with empty-string topic",
      message: {
        ...eg.streamMessage({ stream: eg.makeStream({ name: 'myStream' }) }),
        subject: '',
      },
      expectedNarrows: [HOME_NARROW, streamNarrow('myStream'), topicNarrow('myStream', '')],
    },
    {
      label: 'PM message with one person',
      message: eg.pmMessage({ sender: eg.otherUser }),
      expectedNarrows: [HOME_NARROW, ALL_PRIVATE_NARROW, pm1to1NarrowFromUser(eg.otherUser)],
    },
    {
      label: 'Group PM message',
      message: eg.pmMessage({
        sender: eg.otherUser,
        recipients: [eg.selfUser, eg.otherUser, eg.thirdUser],
      }),
      expectedNarrows: [
        HOME_NARROW,
        ALL_PRIVATE_NARROW,
        pmNarrowFromUsersUnsafe([eg.otherUser, eg.thirdUser]),
      ],
    },
  ];

  cases.forEach(c => {
    checkCase(c);
  });
});

describe('getNarrowForReply', () => {
  test('for self-PM, returns self-1:1 narrow', () => {
    expect(
      getNarrowForReply(
        eg.pmMessage({ sender: eg.selfUser, recipients: [eg.selfUser] }),
        eg.selfUser,
      ),
    ).toEqual(pm1to1NarrowFromUser(eg.selfUser));
  });

  test('for 1:1 PM, returns a 1:1 PM narrow', () => {
    const message = eg.pmMessage();
    const expectedNarrow = pm1to1NarrowFromUser(eg.otherUser);

    const actualNarrow = getNarrowForReply(message, eg.selfUser);

    expect(actualNarrow).toEqual(expectedNarrow);
  });

  test('for group PM, returns a group PM narrow', () => {
    const message = eg.pmMessage({
      recipients: [eg.selfUser, eg.otherUser, eg.thirdUser],
    });
    const expectedNarrow = pmNarrowFromUsersUnsafe([eg.otherUser, eg.thirdUser]);

    const actualNarrow = getNarrowForReply(message, eg.selfUser);

    expect(actualNarrow).toEqual(expectedNarrow);
  });

  test('for stream message with nonempty topic, returns a topic narrow', () => {
    const message = eg.streamMessage();
    const expectedNarrow = topicNarrow(eg.stream.name, message.subject);

    const actualNarrow = getNarrowForReply(message, eg.selfUser);

    expect(actualNarrow).toEqual(expectedNarrow);
  });
});

describe('keyFromNarrow+parseNarrow', () => {
  const baseNarrows = [
    ['whole stream', streamNarrow(eg.stream.name)],
    ['stream conversation', topicNarrow(eg.stream.name, 'a topic')],
    ['1:1 PM conversation, non-self', pm1to1NarrowFromUser(eg.otherUser)],
    ['self-1:1 conversation', pm1to1NarrowFromUser(eg.selfUser)],
    ['group-PM conversation', pmNarrowFromUsersUnsafe([eg.otherUser, eg.thirdUser])],
    ['all-messages ("home")', HOME_NARROW],
    ['is:starred', STARRED_NARROW],
    ['is:mentioned', MENTIONED_NARROW],
    ['all-PMs', ALL_PRIVATE_NARROW],
    ['search narrow', SEARCH_NARROW('a query')],
  ];

  // The only character not allowed in Zulip stream names is '\x00'.
  // (See `check_stream_name` in zulip.git:zerver/lib/streams.py.)
  // Try approximately everything else.
  /* eslint-disable no-control-regex */
  const diverseCharacters = eg.diverseCharacters.replace(/\x00/g, '');
  const htmlEntities = 'h & t &amp; &lquo;ml&quot;';
  const awkwardNarrows = [
    ['whole stream about awkward characters', streamNarrow(diverseCharacters)],
    ['whole stream about HTML entities', streamNarrow(htmlEntities)],
    [
      'stream conversation about awkward characters',
      topicNarrow(diverseCharacters, `regarding ${diverseCharacters}`),
    ],
    [
      'stream conversation about HTML entities',
      topicNarrow(htmlEntities, `regarding ${htmlEntities}`),
    ],
    ['search narrow for awkward characters', SEARCH_NARROW(diverseCharacters)],
    ['search narrow for HTML entities', SEARCH_NARROW(htmlEntities)],
  ];

  describe('round-trips', () => {
    for (const [description, narrow] of [...baseNarrows, ...awkwardNarrows]) {
      test(description, () => {
        expect(parseNarrow(keyFromNarrow(narrow))).toEqual(narrow);
      });
    }
  });
});
