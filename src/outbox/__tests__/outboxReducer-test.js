import deepFreeze from 'deep-freeze';

import outboxReducers from '../outboxReducers';
import { MESSAGE_SEND, EVENT_NEW_MESSAGE } from '../../actionConstants';

describe('outboxReducers', () => {
  describe(MESSAGE_SEND, () => {
    test('add a new message to outbox', () => {
      const initialState = deepFreeze([]);

      const action = deepFreeze({
        type: MESSAGE_SEND,
        params: {
          content: 'HI there ',
          localMessageId: 1501779388307,
          subject: 'Denmark2',
          to: 'Denmark',
          type: 'stream',
        },
      });

      const expectedState = [
        {
          content: 'HI there ',
          localMessageId: 1501779388307,
          subject: 'Denmark2',
          to: 'Denmark',
          type: 'stream',
        },
      ];

      const actualState = outboxReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe(EVENT_NEW_MESSAGE, () => {
    test('Remove if local message same', () => {
      const initialState = deepFreeze([
        {
          content: 'HI there ',
          localMessageId: 1501779388307,
          subject: 'Denmark2',
          to: 'Denmark',
          type: 'stream',
        },
      ]);

      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        localMessageId: '1501779388307',
      });

      const expectedState = [];

      const actualState = outboxReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('Not to remove if local message not same', () => {
      const initialState = deepFreeze([
        {
          content: 'HI there ',
          subject: 'Denmark2',
          to: 'Denmark',
          type: 'stream',
        },
      ]);

      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
      });

      const expectedState = [
        {
          content: 'HI there ',
          subject: 'Denmark2',
          to: 'Denmark',
          type: 'stream',
        },
      ];
      const actualState = outboxReducers(initialState, action);
      expect(actualState).toEqual(expectedState);
    });
  });
});
