import {getAnchor, getRecentConversations} from '../chatSelectors';
import {specialNarrow} from '../../utils/narrow';

describe('getAnchor', () => {
  test('return max anchor when there are no messages', () => {
    const state = {
      chat: {
        narrow: [],
        messages: {
          '[]': [],
        },
      },
    };
    expect(getAnchor(state)).toEqual({
      older: Number.MAX_SAFE_INTEGER,
      newer: Number.MAX_SAFE_INTEGER,
    });
  });

  test('when single message, anchor ids are the same', () => {
    const state = {
      chat: {
        narrow: [],
        messages: {
          '[]': [{id: 123}],
        },
      },
    };
    expect(getAnchor(state)).toEqual({older: 123, newer: 123});
  });

  test('when 2 or more messages, anchor contains first and last message ids', () => {
    const state = {
      chat: {
        narrow: [],
        messages: {
          '[]': [{id: 1}, {id: 2}, {id: 3}],
        },
      },
    };
    expect(getAnchor(state)).toEqual({older: 1, newer: 3});
  });
});

describe('getRecentConversations', () => {
  const privatesNarrowStr = JSON.stringify(specialNarrow('private'));

  test('when no messages, return no conversations', () => {
    const state = {
      account: [{email: 'me@example.com'}],
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
      account: [{email: 'me@example.com'}],
      chat: {
        messages: {
          [privatesNarrowStr]: [
            {
              display_recipient: [
                {email: 'me@example.com'},
                {email: 'john@example.com'},
              ],
            },
            {display_recipient: [{email: 'mark@example.com'}]},
            {display_recipient: [{email: 'john@example.com'}]},
            {display_recipient: [{email: 'me@example.com'}]},
            {
              display_recipient: [
                {email: 'john@example.com'},
                {email: 'mark@example.com'},
              ],
            },
          ],
        },
      },
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
});
