import { getAnchor, getRecentConversations } from '../chatSelectors';
import { specialNarrow } from '../../utils/narrow';

describe('getAnchor', () => {
  test('return undefined when there are no messages', () => {
    const state = {
      chat: {
        narrow: [],
        messages: {
          '[]': [],
        },
      },
    };
    expect(getAnchor(state)).toEqual(undefined);
  });

  test('when single message, anchor ids are the same', () => {
    const state = {
      chat: {
        narrow: [],
        messages: {
          '[]': [
            { id: 123 },
          ],
        },
      }
    };
    expect(getAnchor(state)).toEqual({ older: 123, newer: 123 });
  });

  test('when 2 or more messages, anchor contains first and last message ids', () => {
    const state = {
      chat: {
        narrow: [],
        messages: {
          '[]': [
            { id: 1 },
            { id: 2 },
            { id: 3 },
          ],
        },
      },
    };
    expect(getAnchor(state)).toEqual({ older: 1, newer: 3 });
  });
});

describe('getRecentConversations', () => {
  const privatesNarrowStr = JSON.stringify(specialNarrow('private'));

  test('when no messages, return no conversations', () => {
    const state = {
      accounts: [{ email: 'me@example.com' }],
      chat: {
        narrow: [],
        messages: {
          [privatesNarrowStr]: [],
        },
      },
    };

    const actual = getRecentConversations(state);

    expect(actual).toEqual([]);
  });

  test('returns unique list of recipients, includes conversations with self', () => {
    const state = {
      accounts: [{ email: 'me@example.com' }],
      chat: {
        messages: {
          [privatesNarrowStr]: [
            { display_recipient: [{ email: 'me@example.com' }, { email: 'john@example.com' }] },
            { display_recipient: [{ email: 'mark@example.com' }] },
            { display_recipient: [{ email: 'john@example.com' }] },
            { display_recipient: [{ email: 'me@example.com' }] },
            { display_recipient: [{ email: 'john@example.com' }, { email: 'mark@example.com' }] },
          ],
        },
      }
    };

    const expectedPrivate = [
      'john@example.com',
      'mark@example.com',
      'me@example.com',
      'john@example.com,mark@example.com',
    ];

    const actual = getRecentConversations(state);

    expect(actual).toEqual(expectedPrivate);
  });

  test.only('returns recipients sorted by last activity', () => {
    const state = {
      accounts: [{ email: 'me@example.com' }],
      chat: {
        messages: {
          [privatesNarrowStr]: [
            {
              display_recipient: [{ email: 'me@example.com' }, { email: 'john@example.com' }],
              timestamp: 2,
            },
            {
              display_recipient: [{ email: 'mark@example.com' }],
              timestamp: 1,
            },
            {
              display_recipient: [{ email: 'john@example.com' }],
              timestamp: 4,
            },
            {
              display_recipient: [{ email: 'mark@example.com' }],
              timestamp: 3,
            },
            {
              display_recipient: [{ email: 'john@example.com' }, { email: 'mark@example.com' }],
              timestamp: 5,
            },
            {
              display_recipient: [{ email: 'me@example.com' }],
              timestamp: 6,
            },
          ],
        },
      }
    };

    const expectedPrivate = [
      'me@example.com',
      'john@example.com,mark@example.com',
      'john@example.com',
      'mark@example.com',
    ];

    const actual = getRecentConversations(state);

    expect(actual).toEqual(expectedPrivate);
  });
});
