import deepFreeze from 'deep-freeze';

import caughtUpReducers from '../caughtUpReducers';
import { MESSAGE_FETCH_START, MESSAGE_FETCH_SUCCESS } from '../../actionConstants';

describe('caughtUpReducers', () => {
  describe('MESSAGE_FETCH_START', () => {
    test('when fetch starts, we consider it not caught up????', () => {
      const initialState = deepFreeze({
        older: true,
        newer: true,
      });

      const action = deepFreeze({
        type: MESSAGE_FETCH_START,
        narrow: [],
      });

      const expectedState = {
        older: false,
        newer: false,
      };

      const newState = caughtUpReducers(initialState, action);

      expect(newState.messages).toEqual(expectedState.messages);
    });
  });

  describe('MESSAGE_FETCH_SUCCESS', () => {
    test('if we receive less messages than expected we consider it caught up', () => {
      const initialState = deepFreeze({
        older: false,
        newer: false,
      });

      const action = deepFreeze({
        type: MESSAGE_FETCH_SUCCESS,
        narrow: [],
        messages: [{ id: 1 }, { id: 2 }, { id: 3 }],
        numBefore: 5,
        numAfter: 5,
      });

      const expectedState = {
        older: true,
        newer: true,
      };

      const newState = caughtUpReducers(initialState, action);

      expect(newState.messages).toEqual(expectedState.messages);
    });
  });
});
