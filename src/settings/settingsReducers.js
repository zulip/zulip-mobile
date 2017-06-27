/* @flow */
import { SettingsState, Action } from '../types';
import { SETTINGS_CHANGE, REALM_INIT } from '../actionConstants';

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
    default:
      return state;
  }
};
