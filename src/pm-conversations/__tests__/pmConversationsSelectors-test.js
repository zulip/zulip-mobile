// @flow strict-local

import * as eg from '../../__tests__/lib/exampleData';
import { getRecentConversations } from '../pmConversationsSelectors';
import { ALL_PRIVATE_NARROW_STR } from '../../utils/narrow';
import { ZulipVersion } from '../../utils/zulipVersion';

describe('getRecentConversations: legacy', () => {
  const zulipVersion = new ZulipVersion('2.0.0');

  test('when no messages, return no conversations', () => {
    const state = eg.reduxState({
      accounts: [eg.makeAccount({ user: eg.selfUser, zulipVersion })],
      realm: eg.realmState({ email: eg.selfUser.email }),
      users: [eg.selfUser],
      narrows: {
        [ALL_PRIVATE_NARROW_STR]: [],
      },
      unread: {
        ...eg.baseReduxState.unread,
        pms: [],
        huddles: [],
      },
    });

    const actual = getRecentConversations(state);

    expect(actual).toEqual([]);
  });

  test('returns unique list of recipients, includes conversations with self', () => {
    const me = eg.makeUser({ user_id: 0, name: 'me' });
    const john = eg.makeUser({ user_id: 1, name: 'john' });
    const mark = eg.makeUser({ user_id: 2, name: 'mark' });

    const state = eg.reduxState({
      accounts: [eg.makeAccount({ user: me, zulipVersion })],
      realm: eg.realmState({ email: me.email }),
      users: [me, john, mark],
      narrows: {
        [ALL_PRIVATE_NARROW_STR]: [0, 1, 2, 3, 4],
      },
      messages: eg.makeMessagesState([
        eg.pmMessageFromTo(john, [me], { id: 1 }),
        eg.pmMessageFromTo(mark, [me], { id: 2 }),
        eg.pmMessageFromTo(john, [me], { id: 3 }),
        eg.pmMessageFromTo(me, [], { id: 4 }),
        eg.pmMessageFromTo(john, [me, mark], { id: 0 }),
      ]),
      unread: {
        ...eg.baseReduxState.unread,
        pms: [
          {
            sender_id: 0,
            unread_message_ids: [4],
          },
          {
            sender_id: 1,
            unread_message_ids: [1, 3],
          },
          {
            sender_id: 2,
            unread_message_ids: [2],
          },
        ],
        huddles: [
          {
            user_ids_string: '0,1,2',
            unread_message_ids: [5],
          },
        ],
      },
    });

    const expectedResult = [
      {
        ids: '0',
        recipients: me.email,
        msgId: 4,
        unread: 1,
      },
      {
        ids: '1',
        recipients: john.email,
        msgId: 3,
        unread: 2,
      },
      {
        ids: '2',
        recipients: mark.email,
        msgId: 2,
        unread: 1,
      },
      {
        ids: '0,1,2',
        recipients: [john.email, mark.email].join(','),
        msgId: 0,
        unread: 1,
      },
    ];

    const actual = getRecentConversations(state);

    expect(actual).toMatchObject(expectedResult);
  });

  test('returns recipients sorted by last activity', () => {
    const me = eg.makeUser({ user_id: 0, name: 'me' });
    const john = eg.makeUser({ user_id: 1, name: 'john' });
    const mark = eg.makeUser({ user_id: 2, name: 'mark' });

    const state = eg.reduxState({
      accounts: [eg.makeAccount({ user: me, zulipVersion })],
      realm: eg.realmState({ email: me.email }),
      users: [me, john, mark],
      narrows: {
        [ALL_PRIVATE_NARROW_STR]: [1, 2, 3, 4, 5, 6],
      },
      messages: eg.makeMessagesState([
        eg.pmMessageFromTo(john, [me], { id: 2 }),
        eg.pmMessageFromTo(mark, [me], { id: 1 }),
        eg.pmMessageFromTo(john, [me], { id: 4 }),
        eg.pmMessageFromTo(mark, [me], { id: 3 }),
        eg.pmMessageFromTo(mark, [me, john], { id: 5 }),
        eg.pmMessageFromTo(me, [], { id: 6 }),
      ]),
      unread: {
        ...eg.baseReduxState.unread,
        pms: [
          {
            sender_id: 0,
            unread_message_ids: [4],
          },
          {
            sender_id: 1,
            unread_message_ids: [1, 3],
          },
          {
            sender_id: 2,
            unread_message_ids: [2],
          },
        ],
        huddles: [
          {
            user_ids_string: '0,1,2',
            unread_message_ids: [5],
          },
        ],
      },
    });

    const expectedResult = [
      {
        ids: '0',
        recipients: me.email,
        msgId: 6,
        unread: 1,
      },
      {
        ids: '0,1,2',
        recipients: [john.email, mark.email].join(','),
        msgId: 5,
        unread: 1,
      },
      {
        ids: '1',
        recipients: john.email,
        msgId: 4,
        unread: 2,
      },
      {
        ids: '2',
        recipients: mark.email,
        msgId: 3,
        unread: 1,
      },
    ];

    const actual = getRecentConversations(state);

    expect(actual).toEqual(expectedResult);
  });
});

describe('getRecentConversations: modern', () => {
  const zulipVersion = new ZulipVersion('2.2.0');

  test('when no recent conversations, return no conversations', () => {
    const state = eg.reduxState({
      accounts: [eg.makeAccount({ user: eg.selfUser, zulipVersion })],
      realm: eg.realmState({ email: eg.selfUser.email }),
      users: [eg.selfUser],
    });

    expect(getRecentConversations(state)).toEqual([]);
  });

  test('returns unique list of recipients, includes conversations with self', () => {
    const users = [eg.selfUser, eg.makeUser({ name: 'john' }), eg.makeUser({ name: 'mark' })];
    const recentPrivateConversations = [
      { max_message_id: 4, user_ids: [] },
      { max_message_id: 3, user_ids: [users[1].user_id] },
      { max_message_id: 2, user_ids: [users[2].user_id] },
      { max_message_id: 0, user_ids: [users[1].user_id, users[2].user_id] },
    ];
    const unread = {
      ...eg.baseReduxState.unread,
      huddles: [
        {
          user_ids_string: [eg.selfUser.user_id, users[1].user_id, users[2].user_id]
            .sort((a, b) => a - b)
            .join(),
          unread_message_ids: [5],
        },
      ],
      pms: [
        {
          sender_id: eg.selfUser.user_id,
          unread_message_ids: [4],
        },
        {
          sender_id: users[1].user_id,
          unread_message_ids: [1, 3],
        },
        {
          sender_id: users[2].user_id,
          unread_message_ids: [2],
        },
      ],
    };

    const state = eg.reduxState({
      accounts: [eg.makeAccount({ user: eg.selfUser, zulipVersion })],
      realm: eg.realmState({ email: eg.selfUser.email }),
      users,
      recentPrivateConversations,
      unread,
    });

    expect(getRecentConversations(state)).toEqual([
      {
        ids: eg.selfUser.user_id.toString(),
        recipients: eg.selfUser.email,
        msgId: 4,
        unread: 1,
      },
      {
        ids: users[1].user_id.toString(),
        recipients: users[1].email,
        msgId: 3,
        unread: 2,
      },
      {
        ids: users[2].user_id.toString(),
        recipients: users[2].email,
        msgId: 2,
        unread: 1,
      },
      {
        ids: [eg.selfUser.user_id, users[1].user_id, users[2].user_id].sort((a, b) => a - b).join(),
        recipients: [users[1].email, users[2].email].join(),
        msgId: 0,
        unread: 1,
      },
    ]);
  });

  test('returns recipients sorted by last activity', () => {
    const users = [eg.selfUser, eg.makeUser({ name: 'john' }), eg.makeUser({ name: 'mark' })];
    const recentPrivateConversations = [
      { max_message_id: 6, user_ids: [] },
      { max_message_id: 5, user_ids: [users[1].user_id, users[2].user_id] },
      { max_message_id: 4, user_ids: [users[1].user_id] },
      { max_message_id: 3, user_ids: [users[2].user_id] },
    ];
    const unread = {
      streams: [],
      huddles: [
        {
          user_ids_string: [eg.selfUser.user_id, users[1].user_id, users[2].user_id]
            .sort((a, b) => a - b)
            .join(),
          unread_message_ids: [5],
        },
      ],
      pms: [
        {
          sender_id: eg.selfUser.user_id,
          unread_message_ids: [4],
        },
        {
          sender_id: users[1].user_id,
          unread_message_ids: [1, 3],
        },
        {
          sender_id: users[2].user_id,
          unread_message_ids: [2],
        },
      ],
      mentions: [],
    };

    const state = eg.reduxState({
      accounts: [eg.makeAccount({ user: eg.selfUser, zulipVersion })],
      realm: eg.realmState({ email: eg.selfUser.email }),
      users,
      recentPrivateConversations,
      unread,
    });

    expect(getRecentConversations(state)).toEqual([
      {
        ids: eg.selfUser.user_id.toString(),
        recipients: eg.selfUser.email,
        msgId: 6,
        unread: 1,
      },
      {
        ids: [eg.selfUser.user_id, users[1].user_id, users[2].user_id].sort((a, b) => a - b).join(),
        recipients: [users[1].email, users[2].email].join(),
        msgId: 5,
        unread: 1,
      },
      {
        ids: users[1].user_id.toString(),
        recipients: users[1].email,
        msgId: 4,
        unread: 2,
      },
      {
        ids: users[2].user_id.toString(),
        recipients: users[2].email,
        msgId: 3,
        unread: 1,
      },
    ]);
  });
});
