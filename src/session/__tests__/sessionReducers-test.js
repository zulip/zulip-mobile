import deepFreeze from 'deep-freeze';

import {
  ACCOUNT_SWITCH,
  CANCEL_EDIT_MESSAGE,
  START_EDIT_MESSAGE,
  LOGIN_SUCCESS,
} from '../../actionConstants';
import sessionReducers from '../sessionReducers';

describe('sessionReducers', () => {
  describe('ACCOUNT_SWITCH', () => {
    test('reissues initial fetch', () => {
      const prevState = deepFreeze({});

      const action = deepFreeze({
        type: ACCOUNT_SWITCH,
      });

      const newState = sessionReducers(prevState, action);

      expect(newState.needsInitialFetch).toBe(true);
    });
  });

  describe('START_EDIT_MESSAGE', () => {
    test('Test start edit message method', () => {
      const prevState = deepFreeze({
        twentyFourHourTime: false,
        pushToken: {},
        emoji: {},
        editMessage: null,
      });

      const action = deepFreeze({
        type: START_EDIT_MESSAGE,
        messageId: 12,
        message: 'test',
      });

      const expectedState = {
        twentyFourHourTime: false,
        pushToken: {},
        emoji: {},
        editMessage: {
          id: 12,
          content: 'test',
        },
      };

      const newState = sessionReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe(CANCEL_EDIT_MESSAGE, () => {
    test('Test cancel edit message method', () => {
      const prevState = deepFreeze({
        twentyFourHourTime: false,
        pushToken: {},
        emoji: {},
        editMessage: {
          id: 12,
          content: 'test',
        },
      });

      const action = deepFreeze({
        type: START_EDIT_MESSAGE,
      });

      const expectedState = {
        twentyFourHourTime: false,
        pushToken: {},
        emoji: {},
        editMessage: {
          content: undefined,
          id: undefined,
        },
      };

      const newState = sessionReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('LOGIN_SUCCESS', () => {
    test('reissues initial fetch', () => {
      const prevState = deepFreeze({});

      const action = deepFreeze({
        type: LOGIN_SUCCESS,
      });

      const newState = sessionReducers(prevState, action);

      expect(newState.needsInitialFetch).toBe(true);
    });
  });
});
