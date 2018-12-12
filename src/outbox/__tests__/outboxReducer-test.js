import deepFreeze from 'deep-freeze';

import outboxReducers from '../outboxReducers';
import {
  INITIAL_FETCH_COMPLETE,
  MESSAGE_SEND_START,
  EVENT_NEW_MESSAGE,
} from '../../actionConstants';
import { streamNarrow } from '../../utils/narrow';

describe('outboxReducers', () => {
  describe(INITIAL_FETCH_COMPLETE, () => {
    test('filters out isSent', () => {
      const initialState = deepFreeze([
        { content: 'New one' },
        { content: 'Another one' },
        { content: 'Message already sent', isSent: true },
      ]);

      const action = deepFreeze({
        type: INITIAL_FETCH_COMPLETE,
      });

      const expectedState = [{ content: 'New one' }, { content: 'Another one' }];

      const actualState = outboxReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe(MESSAGE_SEND_START, () => {
    test('add a new message to outbox', () => {
      const initialState = deepFreeze([]);

      const action = deepFreeze({
        type: MESSAGE_SEND_START,
        outbox: {
          content: 'New one',
          email: 'john@example.com',
          narrow: streamNarrow('denmark'),
          parsedContent: '<p>New one</p>',
          sender_full_name: 'john',
          timestamp: 546,
        },
      });

      const expectedState = [
        {
          content: 'New one',
          email: 'john@example.com',
          narrow: streamNarrow('denmark'),
          parsedContent: '<p>New one</p>',
          sender_full_name: 'john',
          timestamp: 546,
        },
      ];

      const actualState = outboxReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('add a same timestamp message to outbox', () => {
      const initialState = deepFreeze([{ timestamp: 123, content: 'hello' }]);

      const action = deepFreeze({
        type: MESSAGE_SEND_START,
        outbox: {
          email: 'john@example.com',
          narrow: streamNarrow('denmark'),
          parsedContent: '<p>New one</p>',
          sender_full_name: 'john',
          timestamp: 123,
        },
      });

      const actualState = outboxReducers(initialState, action);

      expect(actualState).toBe(initialState);
    });
  });

  describe(EVENT_NEW_MESSAGE, () => {
    test('do not mutate state if a message is not removed', () => {
      const initialState = deepFreeze([
        {
          content: 'New one',
          email: 'john@example.com',
          narrow: streamNarrow('denmark'),
          parsedContent: '<p>New one</p>',
          sender_full_name: 'john',
          timestamp: 546,
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
        { timestamp: 546 },
        { timestamp: 150238512430 },
        { timestamp: 150238594540 },
      ]);

      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        local_message_id: 546,
      });

      const expectedState = [{ timestamp: 150238512430 }, { timestamp: 150238594540 }];

      const actualState = outboxReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('Not to remove if local message not same', () => {
      const initialState = deepFreeze([
        {
          content: 'New one',
          email: 'john@example.com',
          narrow: streamNarrow('denmark'),
          parsedContent: '<p>New one</p>',
          sender_full_name: 'john',
          timestamp: 546,
        },
      ]);

      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        timestamp: 15023859,
      });

      const actualState = outboxReducers(initialState, action);
      expect(actualState).toBe(initialState);
    });
  });
});
