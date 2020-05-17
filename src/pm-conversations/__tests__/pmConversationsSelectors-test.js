// @flow strict-local

import * as eg from '../../__tests__/lib/exampleData';
import { getRecentConversations } from '../pmConversationsSelectors';
import { ALL_PRIVATE_NARROW_STR } from '../../utils/narrow';

describe('getRecentConversations', () => {
  test('when no messages, return no conversations', () => {
    const state = eg.reduxState({
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
        users: [me],
        unread: 1,
      },
      {
        ids: '1',
        recipients: john.email,
        msgId: 3,
        users: [me, john],
        unread: 2,
      },
      {
        ids: '2',
        recipients: mark.email,
        users: [me, mark],
        msgId: 2,
        unread: 1,
      },
      {
        ids: '0,1,2',
        recipients: [john.email, mark.email].join(','),
        msgId: 0,
        users: [me, john, mark],
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
        users: [me],
        unread: 1,
      },
      {
        ids: '0,1,2',
        recipients: [john.email, mark.email].join(','),
        msgId: 5,
        users: [me, john, mark],
        unread: 1,
      },
      {
        ids: '1',
        recipients: john.email,
        msgId: 4,
        users: [me, john],
        unread: 2,
      },
      {
        ids: '2',
        recipients: mark.email,
        msgId: 3,
        users: [me, mark],
        unread: 1,
      },
    ];

    const actual = getRecentConversations(state);

    expect(actual).toEqual(expectedResult);
  });
});
