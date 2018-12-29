import deepFreeze from 'deep-freeze';

import realmReducers from '../realmReducers';
import {
  ACCOUNT_SWITCH,
  EVENT_REALM_EMOJI_UPDATE,
  EVENT_UPDATE_DISPLAY_SETTINGS,
  SAVE_TOKEN_PUSH,
  DELETE_TOKEN_PUSH,
  EVENT_REALM_FILTER_UPDATE,
  INIT_EMOJI_NAME_TO_CODEPOINT,
} from '../../actionConstants';
import { NULL_OBJECT } from '../../nullObjects';
import { unicodeCodeByName } from '../../emoji/codePointMap';

describe('realmReducers', () => {
  describe('ACCOUNT_SWITCH', () => {
    test('resets state to initial state', () => {
      const initialState = NULL_OBJECT;

      const action = deepFreeze({
        type: ACCOUNT_SWITCH,
      });

      const expectedState = {
        canCreateStreams: true,
        crossRealmBots: [],
        isAdmin: false,
        twentyFourHourTime: false,
        pushToken: { token: null },
        emoji: {},
        unicodeCodeByName,
        filters: [],
        nonActiveUsers: [],
      };

      const actualState = realmReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('SAVE_TOKEN_PUSH', () => {
    test('save a new PUSH token', () => {
      const initialState = deepFreeze({
        twentyFourHourTime: false,
        pushToken: { token: null },
        emoji: { customEmoji1: {} },
      });

      const action = deepFreeze({
        type: SAVE_TOKEN_PUSH,
        pushToken: 'new-key',
      });

      const expectedState = {
        twentyFourHourTime: false,
        pushToken: { token: 'new-key' },
        emoji: { customEmoji1: {} },
      };

      const actualState = realmReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('DELETE_TOKEN_PUSH', () => {
    test('delete the PUSH token', () => {
      const initialState = deepFreeze({
        twentyFourHourTime: false,
        pushToken: { token: 'old-key' },
        emoji: { customEmoji1: {} },
      });

      const action = deepFreeze({
        type: DELETE_TOKEN_PUSH,
      });

      const expectedState = {
        twentyFourHourTime: false,
        pushToken: { token: null },
        emoji: { customEmoji1: {} },
      };

      const actualState = realmReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_UPDATE_DISPLAY_SETTINGS', () => {
    test('change the display settings', () => {
      const initialState = deepFreeze({
        twentyFourHourTime: false,
        pushToken: { token: null },
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
        pushToken: { token: null },
        emoji: { customEmoji1: {} },
      };

      const actualState = realmReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_REALM_EMOJI_UPDATE', () => {
    test('update state to new realm_emoji', () => {
      const prevState = deepFreeze({
        twentyFourHourTime: false,
        pushToken: { token: null },
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
        pushToken: { token: null },
        emoji: {
          customEmoji1: {},
          customEmoji2: {},
        },
        filter: [],
      };

      const newState = realmReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('EVENT_REALM_FILTER_UPDATE', () => {
    test('update state to new realm_filter', () => {
      const prevState = deepFreeze({
        twentyFourHourTime: false,
        pushToken: { token: null },
        emoji: {},
        filters: [],
      });

      const action = deepFreeze({
        eventId: 4,
        id: 4,
        op: 'update',
        realm_filters: [['#(?P<id>[0-9]+)', 'https://github.com/zulip/zulip/issues/%(id)s', 2]],
        type: EVENT_REALM_FILTER_UPDATE,
      });

      const expectedState = {
        twentyFourHourTime: false,
        pushToken: { token: null },
        emoji: {},
        filters: [['#(?P<id>[0-9]+)', 'https://github.com/zulip/zulip/issues/%(id)s', 2]],
      };

      const newState = realmReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('INIT_EMOJI_NAME_TO_CODEPOINT', () => {
    test('update state to new emojiToCodePoint', () => {
      const initialState = {
        unicodeCodeByName: {},
      };

      const action = {
        type: INIT_EMOJI_NAME_TO_CODEPOINT,
        unicodeCodeByName: {
          '+1': '1f44d',
          '-1': '1f44e',
          '0': '0030-20e3',
        },
      };

      const expectedState = {
        unicodeCodeByName: {
          '+1': '1f44d',
          '-1': '1f44e',
          '0': '0030-20e3',
        },
      };

      expect(realmReducers(initialState, action)).toEqual(expectedState);
    });
  });
});
