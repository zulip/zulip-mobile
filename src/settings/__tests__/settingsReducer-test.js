/* @flow strict-local */
import deepFreeze from 'deep-freeze';

import {
  SET_GLOBAL_SETTINGS,
  EVENT_UPDATE_GLOBAL_NOTIFICATIONS_SETTINGS,
} from '../../actionConstants';
import settingsReducer from '../settingsReducer';
import * as eg from '../../__tests__/lib/exampleData';

describe('settingsReducer', () => {
  const baseState = eg.baseReduxState.settings;

  describe('REGISTER_COMPLETE', () => {
    test('changes value of all notification settings', () => {
      const prevState = deepFreeze({
        ...baseState,
        offlineNotification: false,
        onlineNotification: false,
        streamNotification: false,
      });

      const action = eg.mkActionRegisterComplete({
        enable_offline_push_notifications: true,
        enable_online_push_notifications: true,
        enable_stream_push_notifications: true,
      });

      const actualState = settingsReducer(prevState, action);

      expect(actualState).toMatchObject({
        offlineNotification: true,
        onlineNotification: true,
        streamNotification: true,
      });
    });
  });

  describe('SET_GLOBAL_SETTINGS', () => {
    test('changes value of a key', () => {
      const action = deepFreeze({
        type: SET_GLOBAL_SETTINGS,
        update: { theme: 'night' },
      });

      const expectedState = {
        ...baseState,
        theme: 'night',
      };

      const actualState = settingsReducer(baseState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_UPDATE_GLOBAL_NOTIFICATIONS_SETTINGS', () => {
    test('changes offline notification setting', () => {
      const prevState = deepFreeze({
        ...baseState,
        offlineNotification: false,
      });
      const action = deepFreeze({
        type: EVENT_UPDATE_GLOBAL_NOTIFICATIONS_SETTINGS,
        id: 0,
        notification_name: 'enable_offline_push_notifications',
        setting: true,
      });

      const expectedState = {
        ...baseState,
        offlineNotification: true,
      };

      const actualState = settingsReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('changes online notification setting', () => {
      const prevState = deepFreeze({
        ...baseState,
        onlineNotification: false,
      });
      const action = deepFreeze({
        type: EVENT_UPDATE_GLOBAL_NOTIFICATIONS_SETTINGS,
        id: 0,
        notification_name: 'enable_online_push_notifications',
        setting: true,
      });

      const expectedState = {
        ...baseState,
        onlineNotification: true,
      };

      const actualState = settingsReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('changes stream notification setting', () => {
      const prevState = deepFreeze({
        ...baseState,
        streamNotification: false,
      });
      const action = deepFreeze({
        type: EVENT_UPDATE_GLOBAL_NOTIFICATIONS_SETTINGS,
        id: 0,
        notification_name: 'enable_stream_push_notifications',
        setting: true,
      });

      const expectedState = {
        ...baseState,
        streamNotification: true,
      };

      const actualState = settingsReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });
  });
});
