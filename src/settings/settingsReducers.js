/* @flow strict-local */
import type {
  SettingsState,
  SettingsAction,
  RealmInitAction,
  SettingsChangeAction,
  EventUpdateGlobalNotificationsSettingsAction,
} from '../types';
import {
  SETTINGS_CHANGE,
  REALM_INIT,
  EVENT_UPDATE_GLOBAL_NOTIFICATIONS_SETTINGS,
} from '../actionConstants';

const initialState: SettingsState = {
  locale: 'en',
  theme: 'default',
  offlineNotification: true,
  onlineNotification: true,
  experimentalFeaturesEnabled: false,
  streamNotification: false,
};

const realmInit = (state: SettingsState, action: RealmInitAction): SettingsState => ({
  ...state,
  offlineNotification: action.data.enable_offline_push_notifications,
  onlineNotification: action.data.enable_online_push_notifications,
});

const settingsChange = (state: SettingsState, action: SettingsChangeAction): SettingsState => ({
  ...state,
  ...action.update,
});

const eventUpdateGlobalNotificationsSettings = (
  state: SettingsState,
  action: EventUpdateGlobalNotificationsSettingsAction,
): SettingsState => {
  switch (action.notification_name) {
    case 'enable_offline_push_notifications':
      return { ...state, offlineNotification: action.setting };
    case 'enable_online_push_notifications':
      return { ...state, onlineNotification: action.setting };
    case 'enable_stream_push_notifications':
      return { ...state, streamNotification: action.setting };
    default:
      return state;
  }
};

export default (state: SettingsState = initialState, action: SettingsAction): SettingsState => {
  switch (action.type) {
    case REALM_INIT:
      return realmInit(state, action);

    case SETTINGS_CHANGE:
      return settingsChange(state, action);

    case EVENT_UPDATE_GLOBAL_NOTIFICATIONS_SETTINGS:
      return eventUpdateGlobalNotificationsSettings(state, action);

    default:
      return state;
  }
};
