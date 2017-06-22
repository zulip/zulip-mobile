import realmReducers from '../realmReducers';
import {
  ACCOUNT_SWITCH,
  SAVE_TOKEN_GCM,
  DELETE_TOKEN_GCM,
  EVENT_REALM_EMOJI_UPDATE
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
        emoji: {},
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
        emoji: { customEmoji1: {} },
      };
      const action = {
        type: SAVE_TOKEN_GCM,
        gcmToken: 'new-key'
      };
      const expectedState = {
        twentyFourHourTime: false,
        'gcmToken': 'new-key',
        emoji: { customEmoji1: {} },
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
        emoji: { customEmoji1: {} },
      };
      const action = {
        type: DELETE_TOKEN_GCM,
      };
      const expectedState = {
        twentyFourHourTime: false,
        'gcmToken': '',
        emoji: { customEmoji1: {} },
      };

      const actualState = realmReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_REALM_EMOJI_UPDATE', () => {
    test('update state to new realm_emoji', () => {
      const prevState = {
        twentyFourHourTime: false,
        'gcmToken': 'key',
        emoji: {},
      };
      const action = {
        eventId: 4,
        id: 4,
        op: 'update',
        realm_emoji: {
          customEmoji1: {},
          customEmoji2: {},
        },
        type: EVENT_REALM_EMOJI_UPDATE
      };
      const expectedState = {
        twentyFourHourTime: false,
        'gcmToken': 'key',
        emoji: {
          customEmoji1: {},
          customEmoji2: {},
        }
      };

      const newState = realmReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });
});
