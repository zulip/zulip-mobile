import deepFreeze from 'deep-freeze';

import { SETTINGS_CHANGE, EVENT_UPDATE_GLOBAL_NOTIFICATIONS_SETTINGS } from '../../actionConstants';
import settingsReducers from '../settingsReducers';

describe('settingsReducers', () => {
  describe('SETTINGS_CHANGE', () => {
    test('sets a key if it does not exist', () => {
      const prevState = deepFreeze({});

      const action = deepFreeze({
        type: SETTINGS_CHANGE,
        update: { theme: 'default' },
      });

      const expectedState = {
        theme: 'default',
      };

      const actualState = settingsReducers(prevState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('changes value of an existing key', () => {
      const prevState = deepFreeze({
        theme: 'night',
      });

      const action = deepFreeze({
        type: SETTINGS_CHANGE,
        update: { theme: 'default' },
      });

      const expectedState = {
        theme: 'default',
      };

      const actualState = settingsReducers(prevState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_UPDATE_GLOBAL_NOTIFICATIONS_SETTINGS', () => {
    test('changes the notification settings', () => {
      const prevState = deepFreeze({
        locale: 'en',
        theme: 'default',
        offlineNotification: true,
        onlineNotification: true,
      });

      const action = deepFreeze({
        type: EVENT_UPDATE_GLOBAL_NOTIFICATIONS_SETTINGS,
        eventId: 0,
        id: 0,
        notification_name: 'enable_offline_push_notifications',
        setting: false,
        timestamp: 1498530886.862562,
        user: 'example@zulip.com',
      });

      const expectedState = {
        locale: 'en',
        theme: 'default',
        onlineNotification: true,
        offlineNotification: false,
      };

      const actualState = settingsReducers(prevState, action);

      expect(actualState).toEqual(expectedState);
    });
  });
});
