/* @flow strict-local */
import deepFreeze from 'deep-freeze';

import type { SettingsState } from '../../types';
import {
  SET_GLOBAL_SETTINGS,
  EVENT_UPDATE_GLOBAL_NOTIFICATIONS_SETTINGS,
  EVENT,
} from '../../actionConstants';
import type { InitialData } from '../../api/initialDataTypes';
import type { UserSettings } from '../../api/modelTypes';
import { EventTypes } from '../../api/eventTypes';
import settingsReducer, { initialPerAccountSettingsState } from '../settingsReducer';
import * as eg from '../../__tests__/lib/exampleData';

describe('settingsReducer', () => {
  const baseState = eg.baseReduxState.settings;

  describe('RESET_ACCOUNT_DATA', () => {
    test('resets per-account state without touching global state', () => {
      const prevState = [
        // per-account
        eg.mkActionRegisterComplete({
          user_settings: {
            /* $FlowIgnore[incompatible-cast] - testing modern servers, which
               send user_settings. */
            ...(eg.action.register_complete.data.user_settings: $NonMaybeType<
              InitialData['user_settings'],
            >),
            enable_offline_push_notifications: false,
            enable_online_push_notifications: false,
            enable_stream_push_notifications: true,
            display_emoji_reaction_users: true,
          },
        }),

        // global
        { type: SET_GLOBAL_SETTINGS, update: { theme: 'night' } },
        { type: SET_GLOBAL_SETTINGS, update: { language: 'fr' } },
      ].reduce(settingsReducer, eg.baseReduxState.settings);
      expect(settingsReducer(prevState, eg.action.reset_account_data)).toEqual({
        ...prevState,
        ...initialPerAccountSettingsState,
      });
    });
  });

  describe('REGISTER_COMPLETE', () => {
    test('changes value of all notification settings (legacy, without user_settings)', () => {
      const prevState = deepFreeze({
        ...baseState,
        offlineNotification: false,
        onlineNotification: false,
        streamNotification: false,
      });
      expect(
        settingsReducer(
          prevState,
          eg.mkActionRegisterComplete({
            enable_offline_push_notifications: true,
            enable_online_push_notifications: true,
            enable_stream_push_notifications: true,
            user_settings: undefined,
          }),
        ),
      ).toMatchObject({
        offlineNotification: true,
        onlineNotification: true,
        streamNotification: true,
      });
    });

    test('changes value of all per-account settings (modern, with user_settings)', () => {
      expect(
        settingsReducer(
          deepFreeze({
            ...baseState,
            offlineNotification: false,
            onlineNotification: false,
            streamNotification: false,
            displayEmojiReactionUsers: false,
          }),
          eg.mkActionRegisterComplete({
            user_settings: {
              /* $FlowIgnore[incompatible-cast] - testing modern servers, which
                 send user_settings. */
              ...(eg.action.register_complete.data.user_settings: $NonMaybeType<
                InitialData['user_settings'],
              >),
              enable_offline_push_notifications: true,
              enable_online_push_notifications: true,
              enable_stream_push_notifications: true,
              display_emoji_reaction_users: true,
            },
          }),
        ),
      ).toEqual({
        ...baseState,
        offlineNotification: true,
        onlineNotification: true,
        streamNotification: true,
        displayEmojiReactionUsers: true,
      });
    });
  });

  describe('SET_GLOBAL_SETTINGS', () => {
    test('changes value of a key', () => {
      const action = deepFreeze({
        type: SET_GLOBAL_SETTINGS,
        update: { theme: 'dark' },
      });

      const expectedState = {
        ...baseState,
        theme: 'dark',
      };

      const actualState = settingsReducer(baseState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_UPDATE_GLOBAL_NOTIFICATIONS_SETTINGS', () => {
    test('changes offline notification setting', () => {
      const prevState = deepFreeze({ ...baseState, offlineNotification: false });
      expect(
        settingsReducer(
          prevState,
          deepFreeze({
            type: EVENT_UPDATE_GLOBAL_NOTIFICATIONS_SETTINGS,
            id: 0,
            notification_name: 'enable_offline_push_notifications',
            setting: true,
          }),
        ),
      ).toEqual({ ...baseState, offlineNotification: true });
    });

    test('changes online notification setting', () => {
      const prevState = deepFreeze({ ...baseState, onlineNotification: false });
      expect(
        settingsReducer(
          prevState,
          deepFreeze({
            type: EVENT_UPDATE_GLOBAL_NOTIFICATIONS_SETTINGS,
            id: 0,
            notification_name: 'enable_online_push_notifications',
            setting: true,
          }),
        ),
      ).toEqual({ ...baseState, onlineNotification: true });
    });

    test('changes stream notification setting', () => {
      const prevState = deepFreeze({ ...baseState, streamNotification: false });
      expect(
        settingsReducer(
          prevState,
          deepFreeze({
            type: EVENT_UPDATE_GLOBAL_NOTIFICATIONS_SETTINGS,
            id: 0,
            notification_name: 'enable_stream_push_notifications',
            setting: true,
          }),
        ),
      ).toEqual({ ...baseState, streamNotification: true });
    });
  });

  describe('EVENT', () => {
    describe('type `user_settings`, op `update`', () => {
      const eventCommon = { id: 0, type: EventTypes.user_settings, op: 'update' };

      const mkCheck =
        <S: $Keys<SettingsState>, E: $Keys<UserSettings>>(
          statePropertyName: S,
          eventPropertyName: E,
        ): ((SettingsState[S], UserSettings[E]) => void) =>
        (initialStateValue, eventValue) => {
          test(`${initialStateValue.toString()} → ${eventValue?.toString() ?? '[nullish]'}`, () => {
            const initialState = { ...baseState };
            /* $FlowFixMe[incompatible-type]: Trust that the caller passed the
           right kind of value for its chosen key. */
            initialState[statePropertyName] = initialStateValue;

            const expectedState = { ...initialState };
            /* $FlowFixMe[incompatible-type]: Trust that the caller passed the
           right kind of value for its chosen key. */
            expectedState[statePropertyName] = eventValue;

            expect(
              settingsReducer(initialState, {
                type: EVENT,
                event: { ...eventCommon, property: eventPropertyName, value: eventValue },
              }),
            ).toEqual(expectedState);
          });
        };

      describe('offlineNotification / enable_offline_push_notifications', () => {
        const check = mkCheck('offlineNotification', 'enable_offline_push_notifications');
        check(true, true);
        check(true, false);
        check(false, true);
        check(false, false);
      });

      describe('onlineNotification / enable_online_push_notifications', () => {
        const check = mkCheck('onlineNotification', 'enable_online_push_notifications');
        check(true, true);
        check(true, false);
        check(false, true);
        check(false, false);
      });

      describe('streamNotification / enable_stream_push_notifications', () => {
        const check = mkCheck('streamNotification', 'enable_stream_push_notifications');
        check(true, true);
        check(true, false);
        check(false, true);
        check(false, false);
      });

      describe('displayEmojiReactionUsers / display_emoji_reaction_users', () => {
        const check = mkCheck('displayEmojiReactionUsers', 'display_emoji_reaction_users');
        check(true, true);
        check(true, false);
        check(false, true);
        check(false, false);
      });
    });
  });
});
