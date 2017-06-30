/* @flow */
import type { SettingsState, Action } from '../types';
import { SETTINGS_CHANGE, REALM_INIT, EVENT_UPDATE_GLOBAL_NOTIFICATIONS_SETTINGS } from '../actionConstants';

const initialState: SettingsState = {
  locale: 'en',
  theme: 'default',
  'offlinePushNotification': true,
};

export default (state: SettingsState = initialState, action: Action): SettingsState => {
  switch (action.type) {
    case REALM_INIT:
      return {
        ...state,
        offlinePushNotification: action.data.enable_offline_push_notifications
      };
    case SETTINGS_CHANGE:
      return {
        ...state,
        [action.key]: action.value,
      };
    case EVENT_UPDATE_GLOBAL_NOTIFICATIONS_SETTINGS:
      switch (action.notification_name) {
        case 'enable_offline_push_notifications':
          return { ...state, offlinePushNotification: action.setting };
        default:
          return state;
      }
    default:
      return state;
  }
};
