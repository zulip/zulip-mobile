import realmReducers from '../realmReducers';
import {
  ACCOUNT_SWITCH,
  SAVE_TOKEN_GCM,
  DELETE_TOKEN_GCM
} from '../../actionConstants';

describe('realmReducers', () => {
  describe('ACCOUNT_SWITCH', () => {
    test('resets state to initial state', () => {
      const initialState = {};
      const action = {
        type: ACCOUNT_SWITCH,
      };
      const expectedState = {
        twentyFourHourTime: false,
        'gcmToken': '',
      };

      const actualState = realmReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('SAVE_TOKEN_GCM', () => {
    test('save a new GCM token', () => {
      const initialState = {
        twentyFourHourTime: false,
        'gcmToken': '',
      };
      const action = {
        type: SAVE_TOKEN_GCM,
        gcmToken: 'new-key'
      };
      const expectedState = {
        twentyFourHourTime: false,
        'gcmToken': 'new-key',
      };

      const actualState = realmReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });


  describe('DELETE_TOKEN_GCM', () => {
    test('delete the GCM token', () => {
      const initialState = {
        twentyFourHourTime: false,
        'gcmToken': 'old-key',
      };
      const action = {
        type: DELETE_TOKEN_GCM,
      };
      const expectedState = {
        twentyFourHourTime: false,
        'gcmToken': '',
      };

      const actualState = realmReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });
});
