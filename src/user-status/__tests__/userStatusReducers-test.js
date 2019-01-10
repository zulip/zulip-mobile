import deepFreeze from 'deep-freeze';

import { ACCOUNT_SWITCH, REALM_INIT } from '../../actionConstants';
import userStatusReducers from '../userStatusReducers';

describe('userStatusReducers', () => {
  const testUserStatusData = deepFreeze({
    1: {
      away: true,
    },
    2: {
      status_text: 'Hello, world',
    },
  });

  test('handles unknown action by returning initial state', () => {
    const initialState = {};
    const newState = userStatusReducers(initialState, {});
    expect(newState).toBeDefined();
  });

  describe('ACCOUNT_SWITCH', () => {
    test('resets state to initial state', () => {
      const initialState = testUserStatusData;
      const action = deepFreeze({
        type: ACCOUNT_SWITCH,
      });
      const expectedState = {};

      const actualState = userStatusReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('REALM_INIT', () => {
    test('when `user_status` data is provided init state with it', () => {
      const initialState = deepFreeze({});
      const action = {
        type: REALM_INIT,
        data: {
          user_status: testUserStatusData,
        },
      };

      const actualState = userStatusReducers(initialState, action);

      expect(actualState).toEqual(testUserStatusData);
    });

    test('handles older back-ends that do not have `user_status` by resetting the state', () => {
      const initialState = deepFreeze(testUserStatusData);
      const action = deepFreeze({
        type: REALM_INIT,
        data: {},
      });
      const expectedState = {};

      const actualState = userStatusReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });
});
