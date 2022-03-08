/**
 * @jest-environment jsdom
 * @flow strict-local
 */
import Immutable from 'immutable';
import invariant from 'invariant';

import * as eg from '../../__tests__/lib/exampleData';
import {
  HOME_NARROW,
  streamNarrow,
  topicNarrow,
  pmNarrowFromUsersUnsafe,
  keyFromNarrow,
  ALL_PRIVATE_NARROW,
} from '../../utils/narrow';
import type { Message, Outbox, FlagsState } from '../../types';
import type { ReadWrite } from '../../generics';
import { getEditSequence } from '../generateInboundEventEditSequence';
import { applyEditSequence } from '../js/handleInboundEvents';
import getMessageListElements from '../../message/getMessageListElements';

// Tell ESLint to recognize `check` as a helper function that runs
// assertions.
/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "check"] }] */

// Our translation function, usually given the name _.
const mock_ = m => m; // eslint-disable-line no-underscore-dangle

const user1 = eg.makeUser({ user_id: 1, name: 'nonrandom name one' });
const user2 = eg.makeUser({ user_id: 2, name: 'nonrandom name two' });
const user3 = eg.makeUser({ user_id: 3, name: 'nonrandom name three' });

const stream1 = eg.makeStream({ stream_id: 1, name: 'stream 1' });
const stream2 = eg.makeStream({ stream_id: 2, name: 'stream 2' });

const topic1 = 'topic 1';
const topic2 = 'topic 2';

// Same sender, stream, topic, day
const streamMessages1 = [
  eg.streamMessage({
    id: 1024,
    timestamp: 791985600,
    sender: user1,
    stream: stream1,
    subject: topic1,
  }),
  eg.streamMessage({
    id: 1598,
    timestamp: 791985601,
    sender: user1,
    stream: stream1,
    subject: topic1,
  }),
];
// Different senders; same stream, topic, day
const streamMessages2 = [
  eg.streamMessage({
    id: 7938,
    timestamp: 794404812,
    sender: user1,
    stream: stream1,
    subject: topic1,
  }),
  eg.streamMessage({
    id: 8060,
    timestamp: 794404813,
    sender: user2,
    stream: stream1,
    subject: topic1,
  }),
];
// Same sender, stream, day; different topics
const streamMessages3 = [
  eg.streamMessage({
    id: 4948,
    timestamp: 793195202,
    sender: user1,
    stream: stream1,
    subject: topic1,
  }),
  eg.streamMessage({
    id: 5083,
    timestamp: 793195203,
    sender: user1,
    stream: stream1,
    subject: topic2,
  }),
];
// Same sender, day; different streams, topics
const streamMessages4 = [
  eg.streamMessage({
    id: 6789,
    timestamp: 794404810,
    sender: user1,
    stream: stream1,
    subject: topic1,
  }),
  eg.streamMessage({
    id: 7727,
    timestamp: 794404811,
    sender: user1,
    stream: stream2,
    subject: topic2,
  }),
];
// Same sender, stream, topic; different days
const streamMessages5 = [
  eg.streamMessage({
    id: 9181,
    timestamp: 794404816,
    sender: user1,
    stream: stream1,
    subject: topic1,
  }),
  eg.streamMessage({
    id: 9815,
    timestamp: 795009616,
    sender: user1,
    stream: stream1,
    subject: topic1,
  }),
];

// 1:1 PM, same sender, day
const pmMessages1 = [
  eg.pmMessage({ id: 8849, timestamp: 794404814, sender: user1, recipients: [user1, user2] }),
  eg.pmMessage({ id: 8917, timestamp: 794404815, sender: user1, recipients: [user1, user2] }),
];
// 1:1 PM, different senders; same day
const pmMessages2 = [
  eg.pmMessage({ id: 5287, timestamp: 793195204, sender: user1, recipients: [user1, user2] }),
  eg.pmMessage({ id: 5309, timestamp: 793195205, sender: user2, recipients: [user1, user2] }),
];
// 1:1 PM, same sender; different day
const pmMessages3 = [
  eg.pmMessage({ id: 5829, timestamp: 793195210, sender: user1, recipients: [user1, user2] }),
  eg.pmMessage({ id: 5963, timestamp: 793800010, sender: user1, recipients: [user1, user2] }),
];
// Group PM, same sender, day
const pmMessages4 = [
  eg.pmMessage({
    id: 5377,
    timestamp: 793195206,
    sender: user1,
    recipients: [user1, user2, user3],
  }),
  eg.pmMessage({
    id: 5620,
    timestamp: 793195207,
    sender: user1,
    recipients: [user1, user2, user3],
  }),
];
// Group PM, different senders; same day
const pmMessages5 = [
  eg.pmMessage({
    id: 5637,
    timestamp: 793195208,
    sender: user1,
    recipients: [user1, user2, user3],
  }),
  eg.pmMessage({
    id: 5727,
    timestamp: 793195209,
    sender: user2,
    recipients: [user1, user2, user3],
  }),
];
// Group PM, same sender; different day
const pmMessages6 = [
  eg.pmMessage({
    id: 2794,
    timestamp: 791985602,
    sender: user1,
    recipients: [user1, user2, user3],
  }),
  eg.pmMessage({
    id: 4581,
    timestamp: 792590402,
    sender: user1,
    recipients: [user1, user2, user3],
  }),
];

const plusBackgroundData = {
  ...eg.plusBackgroundData,
  streams: new Map([stream1, stream2].map(s => [s.stream_id, s])),
};

/**
 * Highlight changes in content-HTML generation.
 *
 * Test failures here (which we expect to happen often) will have two
 * major flavors:
 *
 * - Your changes caused different content HTML to be generated from
 *   the same input (list of messages, backgroundData, etc.). You
 *   should examine the changes and see if we want them.
 *   - If they look correct, please follow Jest's instructions to
 *     update the snapshots, and commit the result.
 *   - If they don't look correct, look for bugs that were caused or
 *     revealed by your changes. Please fix them and run the tests
 *     again.
 *
 * - Different input was given on this run of the tests, and naturally
 *   our code produced different output.
 *   - This will be the case when extending these tests to increase
 *     coverage. Thanks for doing that! :)
 *   - But one big "gotcha!" is that we can't vary the input
 *     programmatically with every run of the tests. That's why the
 *     data objects in the input have hard-coded IDs, names, etc.,
 *     instead of random ones (even as `exampleData` is happy to give
 *     us random data, which is often what we want!). If we allow
 *     something in the input to randomly change between test runs,
 *     we're inviting the output to change randomly too, and if that
 *     happens, the snapshots won't match, and the tests will fail. We
 *     should avoid meaningless failures like that; strong tests have
 *     meaningful results.
 *
 * This is our first attempt at testing UI logic with snapshot tests,
 * done in part to help check a refactor of `getMessageListElements`
 * and `messageListElementHtml`.
 */
describe('messages -> piece descriptors -> content HTML is stable/sensible', () => {
  const check = ({ backgroundData = plusBackgroundData, narrow, messages }) => {
    invariant(
      messages.every((message, i, allMessages) => {
        const prevMessage: Message | void = allMessages[i - 1];
        return (
          prevMessage === undefined
          || (prevMessage.id < message.id && prevMessage.timestamp < message.timestamp)
        );
      }),
      'Problem with test data: `messages` should increase monotonically in both `id` and `timestamp`.',
    );

    invariant(document.body, 'expected jsdom environment');
    document.body.innerHTML = '<div id="msglist-elements" />';

    const msglistElementsDiv = document.querySelector('div#msglist-elements');
    invariant(msglistElementsDiv, 'expected msglistElementsDiv');

    // Simulate applying an edit-sequence event to the DOM.
    applyEditSequence(
      getEditSequence(
        { backgroundData, elements: [], _: mock_ },
        { backgroundData, elements: getMessageListElements(messages, narrow), _: mock_ },
      ),
    );

    expect(msglistElementsDiv.innerHTML).toMatchSnapshot();
  };

  test('HOME_NARROW', () => {
    [
      { narrow: HOME_NARROW, messages: streamMessages1 },
      { narrow: HOME_NARROW, messages: streamMessages2 },
      { narrow: HOME_NARROW, messages: streamMessages3 },
      { narrow: HOME_NARROW, messages: streamMessages4 },
      { narrow: HOME_NARROW, messages: streamMessages5 },
      { narrow: HOME_NARROW, messages: pmMessages1 },
      { narrow: HOME_NARROW, messages: pmMessages2 },
      { narrow: HOME_NARROW, messages: pmMessages3 },
      { narrow: HOME_NARROW, messages: pmMessages4 },
      { narrow: HOME_NARROW, messages: pmMessages5 },
      { narrow: HOME_NARROW, messages: pmMessages6 },
      {
        narrow: HOME_NARROW,
        // All together, sorted by ID. (Which basically means jumbled;
        // the IDs in each sub-list are only internally sorted.)
        messages: [
          ...streamMessages1,
          ...streamMessages2,
          ...streamMessages3,
          ...streamMessages4,
          ...streamMessages5,
          ...pmMessages1,
          ...pmMessages2,
          ...pmMessages3,
          ...pmMessages4,
          ...pmMessages5,
          ...pmMessages6,
        ].sort((a, b) => a.id - b.id),
      },
    ].forEach(testCase => check(testCase));
  });

  const streamNarrow1 = streamNarrow(stream1.stream_id);
  test(`${keyFromNarrow(streamNarrow1)}`, () => {
    [
      { narrow: streamNarrow1, messages: streamMessages1 },
      { narrow: streamNarrow1, messages: streamMessages2 },
      { narrow: streamNarrow1, messages: streamMessages3 },
      { narrow: streamNarrow1, messages: streamMessages5 },
      {
        narrow: streamNarrow1,
        // All together, sorted by ID. (Which basically means jumbled;
        // the IDs in each sub-list are only internally sorted.)
        messages: [
          ...streamMessages1,
          ...streamMessages2,
          ...streamMessages3,
          ...streamMessages5,
        ].sort((a, b) => a.id - b.id),
      },
    ].forEach(testCase => check(testCase));
  });

  const topicNarrow1 = topicNarrow(stream1.stream_id, topic1);
  test(`${keyFromNarrow(topicNarrow1)}`, () => {
    [
      { narrow: topicNarrow1, messages: streamMessages1 },
      { narrow: topicNarrow1, messages: streamMessages2 },
      { narrow: topicNarrow1, messages: streamMessages5 },
      {
        narrow: topicNarrow1,
        // All together, sorted by ID. (Which basically means jumbled;
        // the IDs in each sub-list are only internally sorted.)
        messages: [...streamMessages1, ...streamMessages2, ...streamMessages5].sort(
          (a, b) => a.id - b.id,
        ),
      },
    ].forEach(testCase => check(testCase));
  });

  const pmNarrow1to1 = pmNarrowFromUsersUnsafe([user1, user2]);
  test(`${keyFromNarrow(pmNarrow1to1)}`, () => {
    [
      { narrow: pmNarrow1to1, messages: pmMessages1 },
      { narrow: pmNarrow1to1, messages: pmMessages2 },
      { narrow: pmNarrow1to1, messages: pmMessages3 },
      {
        narrow: pmNarrow1to1,
        // All together, sorted by ID. (Which basically means jumbled;
        // the IDs in each sub-list are only internally sorted.)
        messages: [...pmMessages1, ...pmMessages2, ...pmMessages3].sort((a, b) => a.id - b.id),
      },
    ].forEach(testCase => check(testCase));
  });

  const pmNarrowGroup = pmNarrowFromUsersUnsafe([user1, user2, user3]);
  test(`${keyFromNarrow(pmNarrowGroup)}`, () => {
    [
      { narrow: pmNarrowGroup, messages: pmMessages4 },
      { narrow: pmNarrowGroup, messages: pmMessages5 },
      { narrow: pmNarrowGroup, messages: pmMessages6 },
      {
        narrow: pmNarrowGroup,
        // All together, sorted by ID. (Which basically means jumbled;
        // the IDs in each sub-list are only internally sorted.)
        messages: [...pmMessages4, ...pmMessages5, ...pmMessages6].sort((a, b) => a.id - b.id),
      },
    ].forEach(testCase => check(testCase));
  });

  test(`${keyFromNarrow(ALL_PRIVATE_NARROW)}`, () => {
    [
      { narrow: ALL_PRIVATE_NARROW, messages: pmMessages1 },
      { narrow: ALL_PRIVATE_NARROW, messages: pmMessages2 },
      { narrow: ALL_PRIVATE_NARROW, messages: pmMessages3 },
      { narrow: ALL_PRIVATE_NARROW, messages: pmMessages4 },
      { narrow: ALL_PRIVATE_NARROW, messages: pmMessages5 },
      { narrow: ALL_PRIVATE_NARROW, messages: pmMessages6 },
      {
        narrow: ALL_PRIVATE_NARROW,
        // All together, sorted by ID. (Which basically means jumbled;
        // the IDs in each sub-list are only internally sorted.)
        messages: [
          ...pmMessages1,
          ...pmMessages2,
          ...pmMessages3,
          ...pmMessages4,
          ...pmMessages5,
          ...pmMessages6,
        ].sort((a, b) => a.id - b.id),
      },
    ].forEach(testCase => check(testCase));
  });

  describe('other interesting cases (single messages)', () => {
    const stableSelfUser = eg.makeUser({ user_id: 1, name: 'nonrandom name self' });
    const stableOtherUser = eg.makeUser({ user_id: 2, name: 'nonrandom name other' });
    const stableThirdUser = eg.makeUser({ user_id: 3, name: 'nonrandom name third' });

    const singleMessageSender = eg.makeUser({ user_id: 10, name: 'nonrandom name sender' });
    const baseSingleMessage = eg.streamMessage({
      id: -1,
      timestamp: -1,
      stream: eg.makeStream({ stream_id: 1, name: 'nonrandom stream' }),
      sender: singleMessageSender,
    });

    test('message with reactions', () => {
      check({
        narrow: HOME_NARROW,
        messages: [
          {
            ...baseSingleMessage,
            reactions: [
              { ...eg.unicodeEmojiReaction, user_id: stableSelfUser.user_id },
              { ...eg.zulipExtraEmojiReaction, user_id: stableSelfUser.user_id },
              { ...eg.realmEmojiReaction, user_id: stableOtherUser.user_id },
              { ...eg.realmEmojiReaction, user_id: stableThirdUser.user_id },
            ],
          },
        ],
      });
    });

    test('message with a poll', () => {
      const baseSubmessage = {
        message_id: baseSingleMessage.id,
        msg_type: 'widget',
      };

      check({
        narrow: HOME_NARROW,
        backgroundData: {
          ...eg.plusBackgroundData,
          ownUser: stableSelfUser,
          allUsersById: new Map([
            [singleMessageSender.user_id, singleMessageSender],
            [stableSelfUser.user_id, stableSelfUser],
            [stableOtherUser.user_id, stableOtherUser],
          ]),
        },
        messages: [
          {
            ...baseSingleMessage,
            submessages: [
              {
                // poll
                ...baseSubmessage,
                content:
                  '{"widget_type": "poll", "extra_data": {"question": "Choose a choice:", "options": []}}',
                sender_id: baseSingleMessage.sender_id,
                id: 1,
              },
              {
                // "Choice A" added
                ...baseSubmessage,
                content: '{"type":"new_option","idx":1,"option":"Choice A"}',
                sender_id: baseSingleMessage.sender_id,
                id: 2,
              },
              {
                // Vote for "Choice A" by self
                ...baseSubmessage,
                content: `{"type":"vote","key":"${baseSingleMessage.sender_id},1","vote":1}`,
                sender_id: stableSelfUser.user_id,
                id: 3,
              },
              {
                // Vote for "Choice A" by other
                ...baseSubmessage,
                content: `{"type":"vote","key":"${baseSingleMessage.sender_id},1","vote":1}`,
                sender_id: stableOtherUser.user_id,
                id: 4,
              },
              {
                // Vote for "Choice A" by sender
                ...baseSubmessage,
                content: `{"type":"vote","key":"${baseSingleMessage.sender_id},1","vote":1}`,
                sender_id: baseSingleMessage.sender_id,
                id: 5,
              },
              {
                // "Choice B" added
                ...baseSubmessage,
                content: '{"type":"new_option","idx":2,"option":"Choice B"}',
                sender_id: baseSingleMessage.sender_id,
                id: 6,
              },
              {
                // Vote for "Choice B" by other
                ...baseSubmessage,
                content: `{"type":"vote","key":"${baseSingleMessage.sender_id},2","vote":1}`,
                sender_id: stableOtherUser.user_id,
                id: 7,
              },
            ],
          },
        ],
      });
    });

    Object.keys(eg.baseReduxState.flags).forEach(flag => {
      test(`message with flag: ${flag}`, () => {
        const flags: ReadWrite<FlagsState> = { ...eg.plusBackgroundData.flags };
        flags[flag] = { [baseSingleMessage.id]: true };
        check({
          narrow: HOME_NARROW,
          messages: [baseSingleMessage],
          backgroundData: { ...eg.plusBackgroundData, flags },
        });
      });
    });

    test('muted sender', () => {
      check({
        narrow: HOME_NARROW,
        messages: [baseSingleMessage],
        backgroundData: {
          ...eg.plusBackgroundData,
          mutedUsers: Immutable.Map([[baseSingleMessage.sender_id, 1644366787]]),
        },
      });
    });
  });
});

describe('getEditSequence correct for interesting changes', () => {
  const resetMsglist = () => {
    invariant(document.body, 'expected jsdom environment');
    document.body.innerHTML = '<div id="msglist-elements" />';
  };

  const getClonedMsglistElementsDiv = () => {
    const msglistElementsDiv = document.querySelector('div#msglist-elements');
    invariant(msglistElementsDiv, 'getClonedMsglistElementsDiv: expected msglistElementsDiv');

    return msglistElementsDiv.cloneNode(true);
  };

  const check = (
    // TODO: Test with a variety of different things in background data
    {
      backgroundData: oldBackgroundData = plusBackgroundData,
      narrow: oldNarrow = HOME_NARROW,
      messages: oldMessages,
    },
    {
      backgroundData: newBackgroundData = plusBackgroundData,
      narrow: newNarrow = HOME_NARROW,
      messages: newMessages,
    },
  ) => {
    const oldElements = getMessageListElements(oldMessages, oldNarrow);
    const newElements = getMessageListElements(newMessages, newNarrow);

    resetMsglist();

    applyEditSequence(
      getEditSequence(
        { backgroundData: newBackgroundData, elements: [], _: mock_ },
        { backgroundData: newBackgroundData, elements: newElements, _: mock_ },
      ),
    );

    const expectedMsglistElementsDiv = getClonedMsglistElementsDiv();

    resetMsglist();

    applyEditSequence(
      getEditSequence(
        { backgroundData: oldBackgroundData, elements: [], _: mock_ },
        { backgroundData: oldBackgroundData, elements: oldElements, _: mock_ },
      ),
    );

    const realEditSequence = getEditSequence(
      { backgroundData: oldBackgroundData, elements: oldElements, _: mock_ },
      { backgroundData: newBackgroundData, elements: newElements, _: mock_ },
    );

    expect(realEditSequence.length).toMatchSnapshot();
    applyEditSequence(realEditSequence);

    expect(getClonedMsglistElementsDiv().isEqualNode(expectedMsglistElementsDiv)).toBeTrue();
  };

  // All together, sorted by ID. (Which basically means jumbled;
  // the IDs in each sub-list are only internally sorted.)
  const allMessages = [
    ...streamMessages1,
    ...streamMessages2,
    ...streamMessages3,
    ...streamMessages4,
    ...streamMessages5,
    ...pmMessages1,
    ...pmMessages2,
    ...pmMessages3,
    ...pmMessages4,
    ...pmMessages5,
    ...pmMessages6,
  ].sort((a, b) => a.id - b.id);

  const withContentReplaced = <M: Message | Outbox>(m: M): M => ({
    ...(m: M),
    content: eg.randString(),
  });

  describe('from empty', () => {
    test('to empty', () => {
      check({ messages: [] }, { messages: [] });
    });

    test('to one message', () => {
      check({ messages: [] }, { messages: [allMessages[0]] });
    });

    test('to many messages', () => {
      check({ messages: [] }, { messages: allMessages });
    });
  });

  describe('from many messages', () => {
    test('to empty', () => {
      check({ messages: allMessages }, { messages: [] });
    });

    test('to disjoint set of many later messages', () => {
      check(
        { messages: allMessages.slice(0, allMessages.length / 2) },
        { messages: allMessages.slice(allMessages.length / 2, allMessages.length) },
      );
    });

    test('to disjoint set of many earlier messages', () => {
      check(
        { messages: allMessages.slice(allMessages.length / 2, allMessages.length) },
        { messages: allMessages.slice(0, allMessages.length / 2) },
      );
    });

    test('insert one message at end', () => {
      check({ messages: allMessages.slice(0, allMessages.length - 1) }, { messages: allMessages });
    });

    test('delete one message at end', () => {
      check({ messages: allMessages }, { messages: allMessages.slice(0, allMessages.length - 1) });
    });

    test('replace one message at end with new content', () => {
      check(
        { messages: allMessages },
        {
          messages: [
            ...allMessages.slice(0, allMessages.length - 1),
            withContentReplaced(allMessages[allMessages.length - 1]),
          ],
        },
      );
    });

    test('insert one message at start', () => {
      check({ messages: allMessages.slice(1, allMessages.length) }, { messages: allMessages });
    });

    test('delete one message at start', () => {
      check({ messages: allMessages }, { messages: allMessages.slice(1, allMessages.length) });
    });

    test('replace one message at start with new content', () => {
      const [firstMessage, ...rest] = allMessages;

      check({ messages: allMessages }, { messages: [withContentReplaced(firstMessage), ...rest] });
    });

    test('insert many messages at end', () => {
      check({ messages: allMessages.slice(0, allMessages.length / 2) }, { messages: allMessages });
    });

    test('insert many messages at start', () => {
      check(
        { messages: allMessages.slice(allMessages.length / 2, allMessages.length - 1) },
        { messages: allMessages },
      );
    });

    test('insert many messages at start and end', () => {
      const firstThirdIndex = Math.floor(allMessages.length / 3);
      const secondThirdIndex = Math.floor(allMessages.length * (2 / 3));
      check(
        { messages: allMessages.slice(firstThirdIndex, secondThirdIndex) },
        { messages: allMessages },
      );
    });

    test('delete many messages in middle', () => {
      const firstThirdIndex = Math.floor(allMessages.length / 3);
      const secondThirdIndex = Math.floor(allMessages.length * (2 / 3));
      check(
        { messages: allMessages },
        {
          messages: [
            ...allMessages.slice(0, firstThirdIndex),
            ...allMessages.slice(secondThirdIndex, allMessages.length - 1),
          ],
        },
      );
    });

    test('replace one message in middle with new content', () => {
      const midIndex = Math.floor(allMessages.length / 2);
      check(
        { messages: allMessages },
        {
          messages: [
            ...allMessages.slice(0, midIndex),
            withContentReplaced(allMessages[midIndex]),
            ...allMessages.slice(midIndex + 1, allMessages.length - 1),
          ],
        },
      );
    });
  });

  describe('within a given message', () => {
    test('add reactions to a message', () => {
      const message = eg.streamMessage();
      check(
        { messages: [message] },
        { messages: [{ ...message, reactions: [eg.unicodeEmojiReaction] }] },
      );
    });

    test('remove reactions from a message', () => {
      const message = eg.streamMessage({ reactions: [eg.unicodeEmojiReaction] });
      check({ messages: [message] }, { messages: [{ ...message, reactions: [] }] });
    });

    describe('polls', () => {
      const baseMessage = eg.streamMessage();
      const baseSubmessage = {
        message_id: baseMessage.id,
        msg_type: 'widget',
        sender_id: baseMessage.sender_id,
      };
      const msgWithPoll = {
        ...baseMessage,
        submessages: [
          {
            ...baseSubmessage,
            content:
              '{"widget_type": "poll", "extra_data": {"question": "Choose a choice:", "options": []}}',
            id: 1,
          },
        ],
      };
      const msgWithChoice = {
        ...baseMessage,
        submessages: [
          ...msgWithPoll.submessages,
          {
            ...baseSubmessage,
            content: '{"type":"new_option","idx":1,"option":"Choice A"}',
            id: 2,
          },
        ],
      };

      test('choice added', () => {
        check({ messages: [msgWithPoll] }, { messages: [msgWithChoice] });
      });

      const msgWithVote = {
        ...baseMessage,
        submessages: [
          ...msgWithChoice.submessages,
          {
            ...baseSubmessage,
            content: `{"type":"vote","key":"${baseMessage.sender_id},1","vote":1}`,
            id: 3,
          },
        ],
      };

      test('vote added', () => {
        check({ messages: [msgWithChoice] }, { messages: [msgWithVote] });
      });
    });

    test('star a message', () => {
      const message = eg.streamMessage();
      check(
        {
          messages: [message],
          backgroundData: {
            ...eg.plusBackgroundData,
            flags: { ...eg.plusBackgroundData.flags, starred: {} },
          },
        },
        {
          messages: [message],
          backgroundData: {
            ...eg.plusBackgroundData,
            flags: { ...eg.plusBackgroundData.flags, starred: { [message.id]: true } },
          },
        },
      );
    });

    test('unstar a message', () => {
      const message = eg.streamMessage();
      check(
        {
          messages: [message],
          backgroundData: {
            ...eg.plusBackgroundData,
            flags: { ...eg.plusBackgroundData.flags, starred: { [message.id]: true } },
          },
        },
        {
          messages: [message],
          backgroundData: {
            ...eg.plusBackgroundData,
            flags: { ...eg.plusBackgroundData.flags, starred: {} },
          },
        },
      );
    });

    // TODO(#5208): We haven't settled how we want to track name/avatar
    test.todo("sender's name/avatar changed");

    test('mute a sender', () => {
      const message = eg.streamMessage();
      check(
        {
          messages: [message],
          backgroundData: { ...eg.plusBackgroundData, mutedUsers: Immutable.Map() },
        },
        {
          messages: [message],
          backgroundData: {
            ...eg.plusBackgroundData,
            mutedUsers: Immutable.Map([[message.sender_id, 1644366787]]),
          },
        },
      );
    });

    test('unmute a sender', () => {
      const message = eg.streamMessage();
      check(
        {
          messages: [message],
          backgroundData: {
            ...eg.plusBackgroundData,
            mutedUsers: Immutable.Map([[message.sender_id, 1644366787]]),
          },
        },
        {
          messages: [message],
          backgroundData: { ...eg.plusBackgroundData, mutedUsers: Immutable.Map() },
        },
      );
    });

    describe('add/remove/change emoji status', () => {
      const message = eg.streamMessage();
      const emojiStatuses = [
        ['none', null],
        ['unicode', eg.userStatusEmojiUnicode],
        ['realm', eg.userStatusEmojiRealm],
        ['zulip extra', eg.userStatusEmojiZulipExtra],
      ];

      emojiStatuses.forEach(([statusALabel, emojiStatusA]) => {
        emojiStatuses.forEach(([statusBLabel, emojiStatusB]) => {
          let description = `status emoji: ${statusALabel} -> ${statusBLabel}`;
          if (emojiStatusA === emojiStatusB) {
            description += ' (no change)';
          }
          test(description, () => {
            check(
              ...[emojiStatusA, emojiStatusB].map(emojiStatus => ({
                messages: [message],
                backgroundData: {
                  ...eg.plusBackgroundData,
                  userStatuses: Immutable.Map([
                    [
                      message.sender_id,
                      {
                        away: false,
                        status_text: null,
                        status_emoji: emojiStatus,
                      },
                    ],
                  ]),
                },
              })),
            );
          });
        });
      });
    });
  });
});
