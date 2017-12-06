/* @flow */
import deepFreeze from 'deep-freeze';

import localReadReducers from '../localReadReducers';
import { MARK_MESSAGE_AS_READ_LOCALLY, EVENT_UPDATE_MESSAGE_FLAGS } from '../../actionConstants';

describe('localReadReducers', () => {
  describe(MARK_MESSAGE_AS_READ_LOCALLY, () => {
    test('Add only if it is not already present', () => {
      const initialState = deepFreeze([1, 2, 3]);
      const action = {
        type: MARK_MESSAGE_AS_READ_LOCALLY,
        messages: [2, 3, 4, 5],
      };
      const expectedState = [1, 2, 3, 4, 5];

      expect(localReadReducers(initialState, action)).toEqual(expectedState);
    });
  });

  describe(EVENT_UPDATE_MESSAGE_FLAGS, () => {
    test('Remove from local read only if flag is "read" and operation is "add"', () => {
      const initialState = deepFreeze([1, 2, 3]);
      const action = {
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [1, 2],
        flag: 'read',
        operation: 'add',
      };
      const expectedState = [3];

      expect(localReadReducers(initialState, action)).toEqual(expectedState);
    });

    test('Return original state if flag is not "read" or operation is not "add"', () => {
      const initialState = deepFreeze([1, 2, 3]);
      const action = {
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [1, 2],
        flag: 'mention',
        operation: 'add',
      };
      const expectedState = [1, 2, 3];

      expect(localReadReducers(initialState, action)).toEqual(expectedState);
    });
  });
});
