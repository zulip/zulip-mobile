/* @flow strict-local */

import { getRecentConversations } from '../pmConversationsSelectors';
import * as eg from '../../__tests__/lib/exampleData';

describe('getRecentConversations', () => {
  test('when no recent conversations, return no conversations', () => {
    const state = eg.reduxState({
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
