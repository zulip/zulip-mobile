import realmReducers from '../realmReducers';
import {
  ACCOUNT_SWITCH,
  EVENT_REALM_EMOJI_UPDATE,
  EVENT_UPDATE_DISPLAY_SETTINGS,
  SAVE_TOKEN_PUSH,
  DELETE_TOKEN_PUSH,
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
        pushToken: '',
        emoji: {},
      };

      const actualState = realmReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('SAVE_TOKEN_PUSH', () => {
    test('save a new PUSH token', () => {
      const initialState = {
        twentyFourHourTime: false,
        pushToken: '',
        emoji: { customEmoji1: {} },
      };
      const action = {
        type: SAVE_TOKEN_PUSH,
        pushToken: 'new-key',
      };
      const expectedState = {
        twentyFourHourTime: false,
        pushToken: 'new-key',
        emoji: { customEmoji1: {} },
      };

      const actualState = realmReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('DELETE_TOKEN_PUSH', () => {
    test('delete the PUSH token', () => {
      const initialState = {
        twentyFourHourTime: false,
        pushToken: 'old-key',
        emoji: { customEmoji1: {} },
      };
      const action = {
        type: DELETE_TOKEN_PUSH,
      };
      const expectedState = {
        twentyFourHourTime: false,
        pushToken: '',
        emoji: { customEmoji1: {} },
      };

      const actualState = realmReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_UPDATE_DISPLAY_SETTINGS', () => {
    test('change the display settings', () => {
      const initialState = {
        twentyFourHourTime: false,
        gcmToken: '',
        emoji: { customEmoji1: {} },
      };
      const action = {
        type: EVENT_UPDATE_DISPLAY_SETTINGS,
        eventId: 1,
        id: 1,
        setting: true,
        setting_name: 'twenty_four_hour_time',
        user: 'example@zulip.com',
      };
      const expectedState = {
        twentyFourHourTime: true,
        gcmToken: '',
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
        pushToken: 'key',
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
        type: EVENT_REALM_EMOJI_UPDATE,
      };
      const expectedState = {
        twentyFourHourTime: false,
        pushToken: 'key',
        emoji: {
          customEmoji1: {},
          customEmoji2: {},
        },
      };

      const newState = realmReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });
});
