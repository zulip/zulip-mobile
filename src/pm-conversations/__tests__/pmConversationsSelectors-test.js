import deepFreeze from 'deep-freeze';

import { getRecentConversations } from '../pmConversationsSelectors';
import { ALL_PRIVATE_NARROW_STR } from '../../utils/narrow';

describe('getRecentConversations', () => {
  test('when no messages, return no conversations', () => {
    const state = deepFreeze({
      accounts: [{ email: 'me@example.com' }],
      narrows: {
        [ALL_PRIVATE_NARROW_STR]: [],
      },
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
      accounts: [{ email: 'me@example.com' }],
      narrows: {
        [ALL_PRIVATE_NARROW_STR]: [0, 1, 2, 3, 4],
      },
      messages: {
        1: {
          id: 1,
          display_recipient: [
            { id: 0, email: 'me@example.com' },
            { id: 1, email: 'john@example.com' },
          ],
        },
        2: {
          id: 2,
          display_recipient: [
            { id: 0, email: 'me@example.com' },
            { id: 2, email: 'mark@example.com' },
          ],
        },
        3: {
          id: 3,
          display_recipient: [
            { id: 0, email: 'me@example.com' },
            { id: 1, email: 'john@example.com' },
          ],
        },
        4: {
          id: 4,
          display_recipient: [{ id: 0, email: 'me@example.com' }],
        },
        0: {
          id: 0,
          display_recipient: [
            { id: 0, email: 'me@example.com' },
            { id: 1, email: 'john@example.com' },
            { id: 2, email: 'mark@example.com' },
          ],
        },
      },
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
        timestamp: 0,
        unread: 1,
      },
      {
        ids: '1',
        recipients: 'john@example.com',
        msgId: 3,
        timestamp: 0,
        unread: 2,
      },
      {
        ids: '2',
        recipients: 'mark@example.com',
        msgId: 2,
        timestamp: 0,
        unread: 1,
      },
      {
        ids: '0,1,2',
        recipients: 'john@example.com,mark@example.com',
        msgId: 0,
        timestamp: 0,
        unread: 1,
      },
    ];

    const actual = getRecentConversations(state);

    expect(actual).toEqual(expectedResult);
  });

  test('returns recipients sorted by last activity', () => {
    const state = deepFreeze({
      accounts: [{ email: 'me@example.com' }],
      narrows: {
        [ALL_PRIVATE_NARROW_STR]: [1, 2, 3, 4, 5, 6],
      },
      messages: {
        2: {
          id: 2,
          display_recipient: [
            { id: 0, email: 'me@example.com' },
            { id: 1, email: 'john@example.com' },
          ],
          timestamp: 2,
        },
        1: {
          id: 1,
          display_recipient: [
            { id: 0, email: 'me@example.com' },
            { id: 2, email: 'mark@example.com' },
          ],
          timestamp: 1,
        },
        4: {
          id: 4,
          display_recipient: [
            { id: 0, email: 'me@example.com' },
            { id: 1, email: 'john@example.com' },
          ],
          timestamp: 4,
        },
        3: {
          id: 3,
          display_recipient: [
            { id: 0, email: 'me@example.com' },
            { id: 2, email: 'mark@example.com' },
          ],
          timestamp: 3,
        },
        5: {
          id: 5,
          display_recipient: [
            { id: 0, email: 'me@example.com' },
            { id: 1, email: 'john@example.com' },
            { id: 2, email: 'mark@example.com' },
          ],
          timestamp: 5,
        },
        6: {
          id: 6,
          display_recipient: [{ id: 0, email: 'me@example.com' }],
          timestamp: 6,
        },
      },
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
        timestamp: 6,
        unread: 1,
      },
      {
        ids: '0,1,2',
        recipients: 'john@example.com,mark@example.com',
        msgId: 5,
        timestamp: 5,
        unread: 1,
      },
      {
        ids: '1',
        recipients: 'john@example.com',
        msgId: 4,
        timestamp: 4,
        unread: 2,
      },
      {
        ids: '2',
        recipients: 'mark@example.com',
        msgId: 3,
        timestamp: 3,
        unread: 1,
      },
    ];

    const actual = getRecentConversations(state);

    expect(actual).toEqual(expectedResult);
  });
});
