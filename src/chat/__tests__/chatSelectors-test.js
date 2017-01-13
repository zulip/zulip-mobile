import { getPointer, getRecentConversations } from '../chatSelectors';
import { specialNarrow } from '../../utils/narrow';

describe('getPointer', () => {
  test('return max pointer when there are no messages', () => {
    const state = {
      chat: {
        narrow: [],
        messages: {
          '[]': [],
        },
      },
    };
    expect(getPointer(state)).toEqual({
      older: Number.MAX_SAFE_INTEGER,
      newer: Number.MAX_SAFE_INTEGER,
    });
  });

  test('when single message, pointer ids are the same', () => {
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
    expect(getPointer(state)).toEqual({ older: 123, newer: 123 });
  });

  test('when 2 or more messages, pointer contains first and last message ids', () => {
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
    expect(getPointer(state)).toEqual({ older: 1, newer: 3 });
  });
});

describe('getRecentPrivateChats', () => {
  const privatesNarrowStr = JSON.stringify(specialNarrow('private'));

  test('when no messages, return zeroed pointer', () => {
    const state = {
      account: [{ email: 'me@example.com' }],
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

  test('TODO', () => {
    const state = {
      account: [{ email: 'me@example.com' }],
      chat: {
        messages: {
          [privatesNarrowStr]: [
            { display_recipient: [{ email: 'me@example.com' }, { email: 'john@example.com' }] },
            { display_recipient: [{ email: 'mark@example.com' }] },
            { display_recipient: [{ email: 'john@example.com' }] },
            { display_recipient: [{ email: 'john@example.com' }, { email: 'mark@example.com' }] },
          ],
        },
      }
    };

    const expectedPrivate = [
      'john@example.com',
      'mark@example.com',
      'john@example.com,mark@example.com',
    ];

    const actual = getRecentConversations(state);

    expect(actual).toEqual(expectedPrivate);
  });
});
