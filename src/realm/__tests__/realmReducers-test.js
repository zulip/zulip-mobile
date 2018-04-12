import deepFreeze from 'deep-freeze';

import realmReducers from '../realmReducers';
import {
  ACCOUNT_SWITCH,
  EVENT_REALM_EMOJI_UPDATE,
  EVENT_UPDATE_DISPLAY_SETTINGS,
  SAVE_TOKEN_PUSH,
  DELETE_TOKEN_PUSH,
  EVENT_REALM_FILTER_UPDATE,
} from '../../actionConstants';
import { NULL_OBJECT } from '../../nullObjects';

describe('realmReducers', () => {
  describe('ACCOUNT_SWITCH', () => {
    test('resets state to initial state', () => {
      const initialState = NULL_OBJECT;

      const action = deepFreeze({
        type: ACCOUNT_SWITCH,
      });

      const expectedState = {
        canCreateStreams: true,
        isAdmin: false,
        twentyFourHourTime: false,
        pushToken: { token: '', result: '', msg: '' },
        emoji: {},
        filters: [],
      };

      const actualState = realmReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('SAVE_TOKEN_PUSH', () => {
    test('save a new PUSH token', () => {
      const initialState = deepFreeze({
        twentyFourHourTime: false,
        pushToken: { token: '', result: '', msg: '' },
        emoji: { customEmoji1: {} },
      });

      const action = deepFreeze({
        type: SAVE_TOKEN_PUSH,
        pushToken: 'new-key',
        result: 'b',
        msg: 'a',
      });

      const expectedState = {
        twentyFourHourTime: false,
        pushToken: { token: 'new-key', result: 'b', msg: 'a' },
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
        pushToken: { token: 'old-key', result: '', msg: '' },
        emoji: { customEmoji1: {} },
      });

      const action = deepFreeze({
        type: DELETE_TOKEN_PUSH,
      });

      const expectedState = {
        twentyFourHourTime: false,
        pushToken: { token: '', result: '', msg: '' },
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
        pushToken: { token: '', result: '', msg: '' },
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
        pushToken: { token: '', result: '', msg: '' },
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
        pushToken: { token: '', result: '', msg: '' },
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
        pushToken: { token: '', result: '', msg: '' },
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
        pushToken: { token: '', result: '', msg: '' },
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
        pushToken: { token: '', result: '', msg: '' },
        emoji: {},
        filters: [['#(?P<id>[0-9]+)', 'https://github.com/zulip/zulip/issues/%(id)s', 2]],
      };

      const newState = realmReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });
});
