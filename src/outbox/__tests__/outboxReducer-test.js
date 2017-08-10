import deepFreeze from 'deep-freeze';

import outboxReducers from '../outboxReducers';
import { MESSAGE_SEND, EVENT_NEW_MESSAGE } from '../../actionConstants';
import { streamNarrow } from '../../utils/narrow';

describe('outboxReducers', () => {
  describe(MESSAGE_SEND, () => {
    test('add a new message to outbox', () => {
      const initialState = deepFreeze([]);

      const action = deepFreeze({
        type: MESSAGE_SEND,
        params: {
          content: 'New one',
          email: 'AARON@zulip.com',
          narrow: streamNarrow('denmark'),
          parsedContent: '<p>New one</p>',
          sender_full_name: 'john',
          timestamp: 1502385930,
        },
      });

      const expectedState = [
        {
          content: 'New one',
          email: 'AARON@zulip.com',
          narrow: streamNarrow('denmark'),
          parsedContent: '<p>New one</p>',
          sender_full_name: 'john',
          timestamp: 1502385930,
        },
      ];

      const actualState = outboxReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe(EVENT_NEW_MESSAGE, () => {
    test('do not mutate state if a message is not removed', () => {
      const initialState = deepFreeze([
        {
          content: 'New one',
          email: 'AARON@zulip.com',
          narrow: streamNarrow('denmark'),
          parsedContent: '<p>New one</p>',
          sender_full_name: 'john',
          timestamp: 1502385930,
        },
      ]);

      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        timestamp: 123,
      });
      const actualState = outboxReducers(initialState, action);
      expect(actualState).toBe(initialState);
    });

    test('Remove if local message same', () => {
      const initialState = deepFreeze([
        { timestamp: 1502385930 },
        { timestamp: 150238512430 },
        { timestamp: 150238594540 },
      ]);

      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        localMessageId: 1502385930,
      });

      const expectedState = [{ timestamp: 150238512430 }, { timestamp: 150238594540 }];

      const actualState = outboxReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('Not to remove if local message not same', () => {
      const initialState = deepFreeze([
        {
          content: 'New one',
          email: 'AARON@zulip.com',
          narrow: streamNarrow('denmark'),
          parsedContent: '<p>New one</p>',
          sender_full_name: 'john',
          timestamp: 1502385930,
        },
      ]);

      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        timestamp: 15023859,
      });

      const actualState = outboxReducers(initialState, action);
      expect(actualState).toEqual(initialState);
    });
  });
});
