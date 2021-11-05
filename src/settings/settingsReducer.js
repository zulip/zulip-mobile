/* @flow strict-local */
import type { SettingsState, Action } from '../types';
import {
  SET_GLOBAL_SETTINGS,
  REGISTER_COMPLETE,
  EVENT_UPDATE_GLOBAL_NOTIFICATIONS_SETTINGS,
} from '../actionConstants';
import { ensureUnreachable } from '../types';

const initialState: SettingsState = {
  language: 'en',
  theme: 'default',
  offlineNotification: true,
  onlineNotification: true,
  experimentalFeaturesEnabled: false,
  streamNotification: false,
  browser: 'default',
  doNotMarkMessagesAsRead: false,
};

export default (state: SettingsState = initialState, action: Action): SettingsState => {
  switch (action.type) {
    case REGISTER_COMPLETE:
      return {
        ...state,
        offlineNotification: action.data.enable_offline_push_notifications,
        onlineNotification: action.data.enable_online_push_notifications,
        streamNotification: action.data.enable_stream_push_notifications,
      };

    case SET_GLOBAL_SETTINGS:
      return {
        ...state,
        ...action.update,
      };

    case EVENT_UPDATE_GLOBAL_NOTIFICATIONS_SETTINGS:
      switch (action.notification_name) {
        case 'enable_offline_push_notifications':
          return { ...state, offlineNotification: action.setting };
        case 'enable_online_push_notifications':
          return { ...state, onlineNotification: action.setting };
        case 'enable_stream_push_notifications':
          return { ...state, streamNotification: action.setting };
        default:
          ensureUnreachable(action.notification_name);
          return state;
      }

    default:
      return state;
  }
};
