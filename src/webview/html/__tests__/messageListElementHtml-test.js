/* @flow strict-local */
import invariant from 'invariant';

import * as eg from '../../../__tests__/lib/exampleData';
import {
  HOME_NARROW,
  streamNarrow,
  topicNarrow,
  pmNarrowFromUsersUnsafe,
  keyFromNarrow,
  ALL_PRIVATE_NARROW,
} from '../../../utils/narrow';
import type { Message } from '../../../types';
import messageListElementHtml from '../messageListElementHtml';
import getMessageListElements from '../../../message/getMessageListElements';

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
  const user1 = eg.makeUser({ user_id: 1, name: 'nonrandom name one' });
  const user2 = eg.makeUser({ user_id: 2, name: 'nonrandom name two' });
  const user3 = eg.makeUser({ user_id: 3, name: 'nonrandom name three' });

  const stream1 = { ...eg.makeStream({ name: 'stream 1' }), stream_id: 1 };
  const stream2 = { ...eg.makeStream({ name: 'stream 2' }), stream_id: 2 };

  const topic1 = 'topic 1';
  const topic2 = 'topic 2';

  // Tell ESLint to recognize `check` as a helper function that runs
  // assertions.
  /* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "check"] }] */
  const check = ({
    // TODO: Test with a variety of different things in
    // `backgroundData`.
    backgroundData = {
      ...eg.backgroundData,
      streams: new Map([stream1, stream2].map(s => [s.stream_id, s])),
    },
    narrow,
    messages,
  }) => {
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
    expect(
      messageListElementHtml({
        backgroundData,
        messageListElements: getMessageListElements(messages, narrow),
        narrow,
        _: m => m,
      }),
    ).toMatchSnapshot();
  };

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
});
