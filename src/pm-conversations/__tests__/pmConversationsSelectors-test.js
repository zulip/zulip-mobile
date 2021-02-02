/* @flow strict-local */
import Immutable from 'immutable';

import { getRecentConversations } from '../pmConversationsSelectors';
import { keyOfExactUsers } from '../pmConversationsModel';
import { ALL_PRIVATE_NARROW_STR } from '../../utils/narrow';
import * as eg from '../../__tests__/lib/exampleData';
import { ZulipVersion } from '../../utils/zulipVersion';

const keyForUsers = users =>
  users
    .map(u => u.user_id)
    .sort((a, b) => a - b)
    .map(String)
    .join(',');

describe('getRecentConversationsModern', () => {
  const accounts = [{ ...eg.selfAccount, zulipVersion: new ZulipVersion('2.1') }];
  const recentsKeyForUsers = users => keyOfExactUsers(users.map(u => u.user_id));

  test('does its job', () => {
    const state = eg.reduxState({
      accounts,
      realm: eg.realmState({ user_id: eg.selfUser.user_id }),
      users: [eg.selfUser, eg.otherUser, eg.thirdUser],
      unread: {
        ...eg.baseReduxState.unread,
        pms: [
          { sender_id: eg.selfUser.user_id, unread_message_ids: [4] },
          { sender_id: eg.otherUser.user_id, unread_message_ids: [1, 3] },
        ],
        huddles: [
          {
            user_ids_string: keyForUsers([eg.selfUser, eg.otherUser, eg.thirdUser]),
            unread_message_ids: [2],
          },
        ],
      },
      pmConversations: {
        // prettier-ignore
        map: Immutable.Map([
          [[], 4],
          [[eg.otherUser], 3],
          [[eg.otherUser, eg.thirdUser], 2],
        ].map(([k, v]) => [recentsKeyForUsers(k), v])),
        sorted: Immutable.List(
          [[], [eg.otherUser], [eg.otherUser, eg.thirdUser]].map(recentsKeyForUsers),
        ),
      },
    });

    expect(getRecentConversations(state)).toEqual([
      { key: eg.selfUser.user_id.toString(), keyRecipients: [eg.selfUser], msgId: 4, unread: 1 },
      { key: eg.otherUser.user_id.toString(), keyRecipients: [eg.otherUser], msgId: 3, unread: 2 },
      {
        key: keyForUsers([eg.selfUser, eg.otherUser, eg.thirdUser]),
        keyRecipients: [eg.otherUser, eg.thirdUser].sort((a, b) => a.user_id - b.user_id),
        msgId: 2,
        unread: 1,
      },
    ]);
  });
});

describe('getRecentConversationsLegacy', () => {
  const accounts = [{ ...eg.selfAccount, zulipVersion: new ZulipVersion('2.0') }];
  const userJohn = eg.makeUser();
  const userMark = eg.makeUser();

  test('when no messages, return no conversations', () => {
    const state = eg.reduxState({
      accounts,
      realm: eg.realmState({ user_id: eg.selfUser.user_id }),
      users: [eg.selfUser],
      narrows: Immutable.Map({
        [ALL_PRIVATE_NARROW_STR]: [],
      }),
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
    const state = eg.reduxState({
      accounts,
      realm: eg.realmState({ user_id: eg.selfUser.user_id }),
      users: [eg.selfUser, userJohn, userMark],
      narrows: Immutable.Map({
        [ALL_PRIVATE_NARROW_STR]: [0, 1, 2, 3, 4],
      }),
      messages: eg.makeMessagesState([
        eg.pmMessageFromTo(userJohn, [eg.selfUser], { id: 1 }),
        eg.pmMessageFromTo(userMark, [eg.selfUser], { id: 2 }),
        eg.pmMessageFromTo(userJohn, [eg.selfUser], { id: 3 }),
        eg.pmMessageFromTo(eg.selfUser, [], { id: 4 }),
        eg.pmMessageFromTo(userJohn, [eg.selfUser, userMark], { id: 0 }),
      ]),
      unread: {
        ...eg.baseReduxState.unread,
        pms: [
          { sender_id: eg.selfUser.user_id, unread_message_ids: [4] },
          { sender_id: userJohn.user_id, unread_message_ids: [1, 3] },
          { sender_id: userMark.user_id, unread_message_ids: [2] },
        ],
        huddles: [
          {
            user_ids_string: keyForUsers([eg.selfUser, userJohn, userMark]),
            unread_message_ids: [0],
          },
        ],
      },
    });

    const expectedResult = [
      { key: eg.selfUser.user_id.toString(), keyRecipients: [eg.selfUser], msgId: 4, unread: 1 },
      { key: userJohn.user_id.toString(), keyRecipients: [userJohn], msgId: 3, unread: 2 },
      { key: userMark.user_id.toString(), keyRecipients: [userMark], msgId: 2, unread: 1 },
      {
        key: keyForUsers([eg.selfUser, userJohn, userMark]),
        keyRecipients: [userJohn, userMark].sort((a, b) => a.user_id - b.user_id),
        msgId: 0,
        unread: 1,
      },
    ];

    const actual = getRecentConversations(state);

    expect(actual).toMatchObject(expectedResult);
  });

  test('returns recipients sorted by last activity', () => {
    const state = eg.reduxState({
      accounts,
      realm: eg.realmState({ user_id: eg.selfUser.user_id }),
      users: [eg.selfUser, userJohn, userMark],
      narrows: Immutable.Map({
        [ALL_PRIVATE_NARROW_STR]: [1, 2, 3, 4, 5, 6],
      }),
      messages: eg.makeMessagesState([
        eg.pmMessageFromTo(userJohn, [eg.selfUser], { id: 2 }),
        eg.pmMessageFromTo(userMark, [eg.selfUser], { id: 1 }),
        eg.pmMessageFromTo(userJohn, [eg.selfUser], { id: 4 }),
        eg.pmMessageFromTo(userMark, [eg.selfUser], { id: 3 }),
        eg.pmMessageFromTo(userMark, [eg.selfUser, userJohn], { id: 5 }),
        eg.pmMessageFromTo(eg.selfUser, [], { id: 6 }),
      ]),
      unread: {
        ...eg.baseReduxState.unread,
        pms: [
          { sender_id: eg.selfUser.user_id, unread_message_ids: [6] },
          { sender_id: userJohn.user_id, unread_message_ids: [2, 4] },
          { sender_id: userMark.user_id, unread_message_ids: [1, 3] },
        ],
        huddles: [
          {
            user_ids_string: keyForUsers([eg.selfUser, userJohn, userMark]),
            unread_message_ids: [5],
          },
        ],
      },
    });

    const expectedResult = [
      { key: eg.selfUser.user_id.toString(), keyRecipients: [eg.selfUser], msgId: 6, unread: 1 },
      {
        key: keyForUsers([eg.selfUser, userJohn, userMark]),
        keyRecipients: [userJohn, userMark].sort((a, b) => a.user_id - b.user_id),
        msgId: 5,
        unread: 1,
      },
      { key: userJohn.user_id.toString(), keyRecipients: [userJohn], msgId: 4, unread: 2 },
      { key: userMark.user_id.toString(), keyRecipients: [userMark], msgId: 3, unread: 2 },
    ];

    const actual = getRecentConversations(state);

    expect(actual).toEqual(expectedResult);
  });
});
