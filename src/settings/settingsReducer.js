/* @flow strict-local */
import type { SettingsState, Action } from '../types';
import {
  SET_GLOBAL_SETTINGS,
  REGISTER_COMPLETE,
  EVENT_UPDATE_GLOBAL_NOTIFICATIONS_SETTINGS,
  EVENT,
} from '../actionConstants';
import { EventTypes } from '../api/eventTypes';
import { ensureUnreachable } from '../types';

const initialState: SettingsState = {
  //
  // GlobalSettingsState
  //

  language: 'en',
  theme: 'default',
  browser: 'default',
  experimentalFeaturesEnabled: false,
  doNotMarkMessagesAsRead: false,

  //
  // PerAccountSettingsState
  //

  offlineNotification: true,
  onlineNotification: true,
  streamNotification: false,
  displayEmojiReactionUsers: false,
};

// eslint-disable-next-line default-param-last
export default (state: SettingsState = initialState, action: Action): SettingsState => {
  switch (action.type) {
    case REGISTER_COMPLETE: {
      const { data } = action;

      if (data.user_settings) {
        return {
          ...state,
          offlineNotification: data.user_settings.enable_offline_push_notifications,
          onlineNotification: data.user_settings.enable_online_push_notifications,
          streamNotification: data.user_settings.enable_stream_push_notifications,

          // TODO(server-6.0): Remove fallback.
          displayEmojiReactionUsers: data.user_settings.display_emoji_reaction_users ?? false,
        };
      } else {
        // Fall back to InitialDataUpdateDisplaySettings for servers that
        // don't support the user_settings_object client capability.
        return {
          ...state,
          /* $FlowIgnore[incompatible-cast]: If `user_settings` is absent,
             this will be present. */
          offlineNotification: (action.data.enable_offline_push_notifications: boolean),
          // $FlowIgnore[incompatible-cast]
          onlineNotification: (action.data.enable_online_push_notifications: boolean),
          // $FlowIgnore[incompatible-cast]
          streamNotification: (action.data.enable_stream_push_notifications: boolean),
        };
      }
    }

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

    case EVENT: {
      const { event } = action;
      switch (event.type) {
        case EventTypes.user_settings:
          if (event.op === 'update') {
            const { property, value } = event;
            switch (property) {
              case 'enable_offline_push_notifications': {
                // $FlowFixMe[incompatible-cast] - fix UserSettingsUpdateEvent
                return { ...state, offlineNotification: (value: boolean) };
              }
              case 'enable_online_push_notifications': {
                // $FlowFixMe[incompatible-cast] - fix UserSettingsUpdateEvent
                return { ...state, onlineNotification: (value: boolean) };
              }
              case 'enable_stream_push_notifications': {
                // $FlowFixMe[incompatible-cast] - fix UserSettingsUpdateEvent
                return { ...state, streamNotification: (value: boolean) };
              }
              case 'display_emoji_reaction_users': {
                // $FlowFixMe[incompatible-cast] - fix UserSettingsUpdateEvent
                return { ...state, displayEmojiReactionUsers: (value: boolean) };
              }

              default:
                return state;
            }
          }

          return state;

        default:
          return state;
      }
    }

    default:
      return state;
  }
};
