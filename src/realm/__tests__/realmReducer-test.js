import deepFreeze from 'deep-freeze';

import realmReducer from '../realmReducer';
import {
  ACCOUNT_SWITCH,
  EVENT_REALM_EMOJI_UPDATE,
  EVENT_UPDATE_DISPLAY_SETTINGS,
  EVENT_REALM_FILTERS,
} from '../../actionConstants';
import { NULL_OBJECT } from '../../nullObjects';

describe('realmReducer', () => {
  describe('ACCOUNT_SWITCH', () => {
    test('resets state to blank state', () => {
      const initialState = NULL_OBJECT;

      const action = deepFreeze({
        type: ACCOUNT_SWITCH,
      });

      const expectedState = {
        canCreateStreams: true,
        crossRealmBots: [],
        email: '',
        user_id: 0,
        isAdmin: false,
        twentyFourHourTime: false,
        emoji: {},
        filters: [],
        nonActiveUsers: [],
      };

      const actualState = realmReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_UPDATE_DISPLAY_SETTINGS', () => {
    test('change the display settings', () => {
      const initialState = deepFreeze({
        twentyFourHourTime: false,
        emoji: { customEmoji1: {} },
      });

      const action = deepFreeze({
        type: EVENT_UPDATE_DISPLAY_SETTINGS,
        eventId: 1,
        id: 1,
        setting: true,
        setting_name: 'twenty_four_hour_time',
        user: 'example@zulip.com',
      });

      const expectedState = {
        twentyFourHourTime: true,
        emoji: { customEmoji1: {} },
      };

      const actualState = realmReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_REALM_EMOJI_UPDATE', () => {
    test('update state to new realm_emoji', () => {
      const prevState = deepFreeze({
        twentyFourHourTime: false,
        emoji: {},
        filter: [],
      });

      const action = deepFreeze({
        eventId: 4,
        id: 4,
        op: 'update',
        realm_emoji: {
          customEmoji1: {},
          customEmoji2: {},
        },
        type: EVENT_REALM_EMOJI_UPDATE,
      });

      const expectedState = {
        twentyFourHourTime: false,
        emoji: {
          customEmoji1: { code: 'customEmoji1' },
          customEmoji2: { code: 'customEmoji2' },
        },
        filter: [],
      };

      const newState = realmReducer(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('EVENT_REALM_FILTERS', () => {
    test('update state to new realm_filter', () => {
      const prevState = deepFreeze({
        twentyFourHourTime: false,
        emoji: {},
        filters: [],
      });

      const action = deepFreeze({
        eventId: 4,
        id: 4,
        op: 'update',
        realm_filters: [['#(?P<id>[0-9]+)', 'https://github.com/zulip/zulip/issues/%(id)s', 2]],
        type: EVENT_REALM_FILTERS,
      });

      const expectedState = {
        twentyFourHourTime: false,
        emoji: {},
        filters: [['#(?P<id>[0-9]+)', 'https://github.com/zulip/zulip/issues/%(id)s', 2]],
      };

      const newState = realmReducer(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });
});
