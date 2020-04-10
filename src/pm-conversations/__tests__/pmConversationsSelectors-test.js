import deepFreeze from 'deep-freeze';

import { getRecentConversations } from '../pmConversationsSelectors';

describe('getRecentConversations', () => {
  test('when no recent conversations, return no conversations', () => {
    const state = deepFreeze({
      realm: { email: 'me@example.com' },
      recentPrivateConversations: [],
      users: [{ user_id: 0, email: 'me@example.com' }],
      unread: {
        pms: [],
        huddles: [],
      },
    });

    const actual = getRecentConversations(state);

    expect(actual).toEqual([]);
  });

  test('returns unique list of recipients, includes conversations with self', () => {
    const state = deepFreeze({
      realm: { email: 'me@example.com' },
      recentPrivateConversations: [
        { max_message_id: 4, user_ids: [] },
        { max_message_id: 3, user_ids: [1] },
        { max_message_id: 2, user_ids: [2] },
        { max_message_id: 0, user_ids: [1, 2] },
      ],
      users: [
        { user_id: 0, email: 'me@example.com' },
        { user_id: 1, email: 'john@example.com' },
        { user_id: 2, email: 'mark@example.com' },
      ],
      unread: {
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
        recipients: 'me@example.com',
        msgId: 4,
        unread: 1,
      },
      {
        ids: '1',
        recipients: 'john@example.com',
        msgId: 3,
        unread: 2,
      },
      {
        ids: '2',
        recipients: 'mark@example.com',
        msgId: 2,
        unread: 1,
      },
      {
        ids: '0,1,2',
        recipients: 'john@example.com,mark@example.com',
        msgId: 0,
        unread: 1,
      },
    ];

    const actual = getRecentConversations(state);

    expect(actual).toEqual(expectedResult);
  });

  test('returns recipients sorted by last activity', () => {
    const state = deepFreeze({
      realm: { email: 'me@example.com' },
      recentPrivateConversations: [
        { max_message_id: 6, user_ids: [] },
        { max_message_id: 5, user_ids: [1, 2] },
        { max_message_id: 4, user_ids: [1] },
        { max_message_id: 3, user_ids: [2] },
      ],
      users: [
        { user_id: 0, email: 'me@example.com' },
        { user_id: 1, email: 'john@example.com' },
        { user_id: 2, email: 'mark@example.com' },
      ],
      unread: {
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
        recipients: 'me@example.com',
        msgId: 6,
        unread: 1,
      },
      {
        ids: '0,1,2',
        recipients: 'john@example.com,mark@example.com',
        msgId: 5,
        unread: 1,
      },
      {
        ids: '1',
        recipients: 'john@example.com',
        msgId: 4,
        unread: 2,
      },
      {
        ids: '2',
        recipients: 'mark@example.com',
        msgId: 3,
        unread: 1,
      },
    ];

    const actual = getRecentConversations(state);

    expect(actual).toEqual(expectedResult);
  });
});
