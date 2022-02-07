import deepFreeze from 'deep-freeze';

import { ACCOUNT_SWITCH, REGISTER_COMPLETE, EVENT_USER_STATUS_UPDATE } from '../../actionConstants';
import userStatusReducer from '../userStatusReducer';

describe('userStatusReducer', () => {
  const testUserStatusState = deepFreeze({
    1: {
      away: true,
    },
    2: {
      status_text: 'Hello, world',
    },
  });

  test('handles unknown action by returning initial state', () => {
    const initialState = {};
    const newState = userStatusReducer(initialState, {});
    expect(newState).toBeDefined();
  });

  describe('ACCOUNT_SWITCH', () => {
    test('resets state to initial state', () => {
      const initialState = testUserStatusState;
      const action = deepFreeze({
        type: ACCOUNT_SWITCH,
      });
      const expectedState = {};

      const actualState = userStatusReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('REGISTER_COMPLETE', () => {
    test('when `user_status` data is provided init state with it', () => {
      const initialState = deepFreeze({});
      const action = {
        type: REGISTER_COMPLETE,
        data: {
          user_status: deepFreeze({
            1: {
              away: true,
            },
            2: {
              status_text: 'Hello, world',
            },
          }),
        },
      };

      const actualState = userStatusReducer(initialState, action);

      expect(actualState).toEqual(testUserStatusState);
    });

    test('handles older back-ends that do not have `user_status` data by resetting the state', () => {
      const initialState = deepFreeze(testUserStatusState);
      const action = deepFreeze({
        type: REGISTER_COMPLETE,
        data: {},
      });
      const expectedState = {};

      const actualState = userStatusReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_USER_STATUS_UPDATE', () => {
    test('when the user does not already have entry add a key by their `user_id`', () => {
      const initialState = deepFreeze({
        2: {
          away: true,
        },
      });
      const action = {
        type: EVENT_USER_STATUS_UPDATE,
        user_id: 1,
        away: true,
      };
      const expectedState = {
        1: {
          away: true,
        },
        2: {
          away: true,
        },
      };

      const actualState = userStatusReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('if the user already has user status stored update their key', () => {
      const initialState = deepFreeze({
        1: {
          away: false,
        },
      });
      const action = deepFreeze({
        type: EVENT_USER_STATUS_UPDATE,
        user_id: 1,
        away: true,
      });
      const expectedState = {
        1: {
          away: true,
        },
      };

      const actualState = userStatusReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('when the user_ status text is updated this is reflected in the state', () => {
      const initialState = deepFreeze({});
      const action = deepFreeze({
        type: EVENT_USER_STATUS_UPDATE,
        user_id: 1,
        status_text: 'Hello, world!',
      });
      const expectedState = {
        1: {
          status_text: 'Hello, world!',
        },
      };

      const actualState = userStatusReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('both `away` and `status_text` values can be updated in one event', () => {
      const initialState = deepFreeze({
        1: {
          away: false,
        },
      });
      const action = deepFreeze({
        type: EVENT_USER_STATUS_UPDATE,
        user_id: 1,
        away: true,
        status_text: 'Hello, world!',
      });
      const expectedState = {
        1: {
          away: true,
          status_text: 'Hello, world!',
        },
      };

      const actualState = userStatusReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('if `away` status is removed delete the key from the object', () => {
      const initialState = deepFreeze({
        1: {
          away: true,
        },
      });
      const action = deepFreeze({
        type: EVENT_USER_STATUS_UPDATE,
        user_id: 1,
        away: false,
      });
      const expectedState = {
        1: {},
      };

      const actualState = userStatusReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('if `status_text` is removed delete the key from the object', () => {
      const initialState = deepFreeze({
        1: {
          status_text: 'Hello, world!',
        },
      });
      const action = deepFreeze({
        type: EVENT_USER_STATUS_UPDATE,
        user_id: 1,
        status_text: '',
      });
      const expectedState = {
        1: {},
      };

      const actualState = userStatusReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });
});
