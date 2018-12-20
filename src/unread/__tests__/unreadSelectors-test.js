import deepFreeze from 'deep-freeze';

import {
  getUnreadByStream,
  getUnreadStreamTotal,
  getUnreadByPms,
  getUnreadPmsTotal,
  getUnreadByHuddles,
  getUnreadHuddlesTotal,
  getUnreadMentionsTotal,
  getUnreadPrivateMessagesCount,
  getUnreadTotal,
  getUnreadStreamsAndTopics,
  getUnreadStreamsAndTopicsSansMuted,
} from '../unreadSelectors';
import { ALL_PRIVATE_NARROW_STR } from '../../utils/narrow';

const unreadStreamData = [
  {
    stream_id: 0,
    topic: 'a topic',
    unread_message_ids: [1, 2, 3],
  },
  {
    stream_id: 0,
    topic: 'another topic',
    unread_message_ids: [4, 5],
  },
  {
    stream_id: 2,
    topic: 'some other topic',
    unread_message_ids: [6, 7],
  },
];

const unreadPmsData = [
  {
    sender_id: 0,
    unread_message_ids: [1, 2],
  },
  {
    sender_id: 2,
    unread_message_ids: [3, 4, 5],
  },
];

const unreadHuddlesData = [
  {
    user_ids_string: '1,2,3',
    unread_message_ids: [1, 2],
  },
  {
    user_ids_string: '4,5',
    unread_message_ids: [3, 4, 5],
  },
];

const unreadMentionsData = [1, 2, 3];

describe('getUnreadByStream', () => {
  test('when no items in streams key, the result is an empty object', () => {
    const state = deepFreeze({
      subscriptions: [],
      unread: {
        streams: [],
      },
    });

    const unreadByStream = getUnreadByStream(state);

    expect(unreadByStream).toEqual({});
  });

  test('when there are unread stream messages, returns a list with counts per stream_id ', () => {
    const state = deepFreeze({
      subscriptions: [
        {
          stream_id: 0,
          name: 'stream 0',
          in_home_view: true,
        },
        {
          stream_id: 2,
          name: 'stream 2',
          in_home_view: true,
        },
      ],
      unread: {
        streams: unreadStreamData,
      },
      mute: [['stream 0', 'a topic']],
    });

    const unreadByStream = getUnreadByStream(state);

    expect(unreadByStream).toEqual({ '0': 2, '2': 2 });
  });
});

describe('getUnreadStreamTotal', () => {
  test('when no items in "streams" key, there are unread message', () => {
    const state = deepFreeze({
      unread: {
        streams: [],
      },
      subscriptions: [],
      mute: [],
    });

    const unreadCount = getUnreadStreamTotal(state);

    expect(unreadCount).toEqual(0);
  });

  test('count all the unread messages listed in "streams" key', () => {
    const state = deepFreeze({
      unread: {
        streams: unreadStreamData,
      },
      subscriptions: [
        {
          stream_id: 0,
          in_home_view: true,
        },
        {
          stream_id: 0,
          in_home_view: true,
        },
        {
          stream_id: 2,
          in_home_view: true,
        },
      ],
      mute: [],
    });

    const unreadCount = getUnreadStreamTotal(state);

    expect(unreadCount).toEqual(7);
  });
});

describe('getUnreadByPms', () => {
  test('when no items in streams key, the result is an empty array', () => {
    const state = deepFreeze({
      unread: {
        pms: [],
      },
    });

    const unreadByStream = getUnreadByPms(state);

    expect(unreadByStream).toEqual({});
  });

  test('when there are unread private messages, returns counts by sender_id', () => {
    const state = deepFreeze({
      unread: {
        pms: unreadPmsData,
      },
    });

    const unreadByStream = getUnreadByPms(state);

    expect(unreadByStream).toEqual({ '0': 2, '2': 3 });
  });
});

describe('getUnreadPmsTotal', () => {
  test('when no items in "pms" key, there are unread private messages', () => {
    const state = deepFreeze({
      unread: {
        pms: [],
      },
    });

    const unreadCount = getUnreadPmsTotal(state);

    expect(unreadCount).toEqual(0);
  });

  test('when there are keys in "pms", sum up all unread private message counts', () => {
    const state = deepFreeze({
      unread: {
        pms: unreadPmsData,
      },
    });

    const unreadCount = getUnreadPmsTotal(state);

    expect(unreadCount).toEqual(5);
  });
});

describe('getUnreadByHuddles', () => {
  test('when no items in streams key, the result is an empty array', () => {
    const state = deepFreeze({
      unread: {
        huddles: [],
      },
    });

    const unreadByStream = getUnreadByHuddles(state);

    expect(unreadByStream).toEqual({});
  });

  test('when there are unread stream messages, returns a ', () => {
    const state = deepFreeze({
      unread: {
        huddles: unreadHuddlesData,
      },
    });

    const unreadByStream = getUnreadByHuddles(state);

    expect(unreadByStream).toEqual({ '1,2,3': 2, '4,5': 3 });
  });
});

describe('getUnreadHuddlesTotal', () => {
  test('when no items in "huddles" key, there are unread group messages', () => {
    const state = deepFreeze({
      unread: {
        huddles: [],
      },
    });

    const unreadCount = getUnreadHuddlesTotal(state);

    expect(unreadCount).toEqual(0);
  });

  test('when there are keys in "huddles", sum up all unread group message counts', () => {
    const state = deepFreeze({
      unread: {
        huddles: unreadHuddlesData,
      },
    });

    const unreadCount = getUnreadHuddlesTotal(state);

    expect(unreadCount).toEqual(5);
  });
});

describe('getUnreadMentionsTotal', () => {
  test('unread mentions count is equal to the unread array length', () => {
    const state = deepFreeze({
      unread: {
        mentions: [1, 2, 3],
      },
    });

    const unreadCount = getUnreadMentionsTotal(state);

    expect(unreadCount).toEqual(3);
  });
});

describe('getUnreadTotal', () => {
  test('if no key has any items then no unread messages', () => {
    const state = deepFreeze({
      unread: {
        streams: [],
        pms: [],
        huddles: [],
        mentions: [],
      },
      subscriptions: [],
      mute: [],
    });

    const unreadCount = getUnreadTotal(state);

    expect(unreadCount).toEqual(0);
  });

  test('calculates total unread of streams + pms + huddles', () => {
    const state = deepFreeze({
      unread: {
        streams: unreadStreamData,
        pms: unreadPmsData,
        huddles: unreadHuddlesData,
        mentions: unreadMentionsData,
      },
      subscriptions: [
        {
          stream_id: 0,
          in_home_view: true,
        },
        {
          stream_id: 0,
          in_home_view: true,
        },
        {
          stream_id: 2,
          in_home_view: true,
        },
      ],
      mute: [],
    });

    const unreadCount = getUnreadTotal(state);

    expect(unreadCount).toEqual(20);
  });
});

describe('getUnreadStreamsAndTopics', () => {
  test('if no key has any items then no unread messages', () => {
    const state = deepFreeze({
      subscriptions: [],
      unread: {
        streams: [],
      },
    });

    const unreadCount = getUnreadStreamsAndTopics(state);

    expect(unreadCount).toEqual([]);
  });

  test('muted streams are included', () => {
    const state = deepFreeze({
      subscriptions: [
        {
          stream_id: 0,
          name: 'stream 0',
          color: 'red',
          in_home_view: false,
        },
        {
          stream_id: 2,
          name: 'stream 2',
          color: 'blue',
          in_home_view: false,
        },
      ],
      unread: {
        streams: unreadStreamData,
      },
      mute: [],
    });

    const unreadCount = getUnreadStreamsAndTopics(state);

    expect(unreadCount).toEqual([
      {
        color: 'red',
        data: [
          {
            isMuted: false,
            key: 'another topic',
            lastUnreadMsgId: 5,
            topic: 'another topic',
            unread: 2,
          },
          {
            isMuted: false,
            key: 'a topic',
            lastUnreadMsgId: 3,
            topic: 'a topic',
            unread: 3,
          },
        ],
        isMuted: true,
        key: 'stream 0',
        streamName: 'stream 0',
        unread: 5,
      },
      {
        color: 'blue',
        data: [
          {
            isMuted: false,
            key: 'some other topic',
            lastUnreadMsgId: 7,
            topic: 'some other topic',
            unread: 2,
          },
        ],
        isMuted: true,
        key: 'stream 2',
        streamName: 'stream 2',
        unread: 2,
      },
    ]);
  });

  test('muted topics inside non muted streams are included', () => {
    const state = deepFreeze({
      subscriptions: [
        {
          stream_id: 0,
          name: 'stream 0',
          color: 'red',
          in_home_view: true,
        },
        {
          stream_id: 2,
          name: 'stream 2',
          color: 'blue',
          in_home_view: true,
        },
      ],
      unread: {
        streams: unreadStreamData,
      },
      mute: [['stream 0', 'a topic']],
    });

    const unreadCount = getUnreadStreamsAndTopics(state);

    expect(unreadCount).toEqual([
      {
        color: 'red',
        data: [
          {
            isMuted: false,
            key: 'another topic',
            topic: 'another topic',
            unread: 2,
            lastUnreadMsgId: 5,
          },
          {
            isMuted: true,
            key: 'a topic',
            topic: 'a topic',
            unread: 3,
            lastUnreadMsgId: 3,
          },
        ],
        isMuted: false,
        isPrivate: undefined,
        key: 'stream 0',
        streamName: 'stream 0',
        unread: 2,
      },
      {
        color: 'blue',
        data: [
          {
            isMuted: false,
            key: 'some other topic',
            lastUnreadMsgId: 7,
            topic: 'some other topic',
            unread: 2,
          },
        ],
        isMuted: false,
        key: 'stream 2',
        streamName: 'stream 2',
        unread: 2,
      },
    ]);
  });

  test('group data by stream and topics inside, count unread', () => {
    const state = deepFreeze({
      subscriptions: [
        {
          stream_id: 0,
          name: 'stream 0',
          color: 'red',
          in_home_view: true,
        },
        {
          stream_id: 2,
          name: 'stream 2',
          color: 'blue',
          in_home_view: true,
        },
      ],
      unread: {
        streams: unreadStreamData,
      },
      mute: [],
    });

    const unreadCount = getUnreadStreamsAndTopics(state);

    expect(unreadCount).toEqual([
      {
        key: 'stream 0',
        streamName: 'stream 0',
        color: 'red',
        unread: 5,
        isMuted: false,
        data: [
          {
            key: 'another topic',
            topic: 'another topic',
            unread: 2,
            isMuted: false,
            lastUnreadMsgId: 5,
          },
          { key: 'a topic', topic: 'a topic', unread: 3, isMuted: false, lastUnreadMsgId: 3 },
        ],
      },
      {
        key: 'stream 2',
        streamName: 'stream 2',
        color: 'blue',
        unread: 2,
        isMuted: false,
        data: [
          {
            key: 'some other topic',
            topic: 'some other topic',
            unread: 2,
            isMuted: false,
            lastUnreadMsgId: 7,
          },
        ],
      },
    ]);
  });

  test('streams are sorted alphabetically, case-insensitive, topics by last activity', () => {
    const state = deepFreeze({
      subscriptions: [
        {
          stream_id: 2,
          color: 'green',
          name: 'def stream',
          in_home_view: true,
          invite_only: false,
          pin_to_top: false,
        },
        {
          stream_id: 1,
          color: 'blue',
          name: 'xyz stream',
          in_home_view: true,
          invite_only: false,
          pin_to_top: true,
        },
        {
          stream_id: 0,
          color: 'red',
          name: 'abc stream',
          in_home_view: true,
          invite_only: false,
          pin_to_top: false,
        },
      ],
      unread: {
        streams: [
          {
            stream_id: 0,
            topic: 'z topic',
            unread_message_ids: [1, 2, 3],
          },
          {
            stream_id: 0,
            topic: 'a topic',
            unread_message_ids: [4, 5],
          },
          {
            stream_id: 2,
            topic: 'b topic',
            unread_message_ids: [6, 7],
          },
          {
            stream_id: 2,
            topic: 'c topic',
            unread_message_ids: [7, 8],
          },
          {
            stream_id: 1,
            topic: 'e topic',
            unread_message_ids: [10],
          },
          {
            stream_id: 1,
            topic: 'd topic',
            unread_message_ids: [9],
          },
        ],
      },
      mute: [['def stream', 'c topic']],
    });

    const unreadCount = getUnreadStreamsAndTopics(state);

    expect(unreadCount).toEqual([
      {
        key: 'abc stream',
        streamName: 'abc stream',
        color: 'red',
        isMuted: false,
        isPrivate: false,
        isPinned: false,
        unread: 5,
        data: [
          { key: 'a topic', topic: 'a topic', unread: 2, isMuted: false, lastUnreadMsgId: 5 },
          { key: 'z topic', topic: 'z topic', unread: 3, isMuted: false, lastUnreadMsgId: 3 },
        ],
      },
      {
        key: 'def stream',
        streamName: 'def stream',
        color: 'green',
        isMuted: false,
        isPrivate: false,
        isPinned: false,
        unread: 2,
        data: [
          { key: 'c topic', topic: 'c topic', unread: 2, isMuted: true, lastUnreadMsgId: 8 },
          { key: 'b topic', topic: 'b topic', unread: 2, isMuted: false, lastUnreadMsgId: 7 },
        ],
      },
      {
        key: 'xyz stream',
        streamName: 'xyz stream',
        color: 'blue',
        isMuted: false,
        isPrivate: false,
        isPinned: true,
        unread: 2,
        data: [
          { key: 'e topic', topic: 'e topic', unread: 1, isMuted: false, lastUnreadMsgId: 10 },
          { key: 'd topic', topic: 'd topic', unread: 1, isMuted: false, lastUnreadMsgId: 9 },
        ],
      },
    ]);
  });
});

describe('getUnreadStreamsAndTopicsSansMuted', () => {
  test('muted streams are not included', () => {
    const state = deepFreeze({
      subscriptions: [
        {
          stream_id: 0,
          name: 'stream 0',
          color: 'red',
          in_home_view: false,
        },
        {
          stream_id: 2,
          name: 'stream 2',
          color: 'blue',
          in_home_view: false,
        },
      ],
      unread: {
        streams: unreadStreamData,
      },
      mute: [],
    });

    const unreadCount = getUnreadStreamsAndTopicsSansMuted(state);

    expect(unreadCount).toEqual([]);
  });

  test('muted topics inside non muted streams are not included', () => {
    const state = deepFreeze({
      subscriptions: [
        {
          stream_id: 0,
          name: 'stream 0',
          color: 'red',
          in_home_view: true,
        },
      ],
      unread: {
        streams: unreadStreamData,
      },
      mute: [['stream 0', 'a topic']],
    });

    const unreadCount = getUnreadStreamsAndTopicsSansMuted(state);

    expect(unreadCount).toEqual([
      {
        color: 'red',
        data: [
          {
            isMuted: false,
            key: 'another topic',
            topic: 'another topic',
            unread: 2,
            lastUnreadMsgId: 5,
          },
        ],
        isMuted: false,
        isPrivate: undefined,
        key: 'stream 0',
        streamName: 'stream 0',
        unread: 2,
      },
    ]);
  });
});

describe('getUnreadPrivateMessagesCount', () => {
  test('when no private messages, unread count is 0', () => {
    const state = deepFreeze({
      flags: {},
      narrows: {
        '[]': [],
      },
      outbox: [],
    });

    const actualCount = getUnreadPrivateMessagesCount(state);

    expect(actualCount).toEqual(0);
  });

  test('count all messages in "private messages" narrow, skip read', () => {
    const state = deepFreeze({
      narrows: {
        '[]': [1, 2],
        [ALL_PRIVATE_NARROW_STR]: [2, 3, 4],
      },
      messages: {
        1: { id: 1 },
        2: { id: 2 },
        3: { id: 3 },
        4: { id: 4 },
      },
      flags: {
        read: {
          3: true,
        },
      },
      outbox: [],
    });

    const actualCount = getUnreadPrivateMessagesCount(state);

    expect(actualCount).toEqual(2);
  });
});
