/* @flow strict-local */
import type { RealmState, Action, RealmEmojiById } from '../types';
import {
  REALM_INIT,
  EVENT_REALM_EMOJI_UPDATE,
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  EVENT_UPDATE_DISPLAY_SETTINGS,
  EVENT_REALM_FILTERS,
} from '../actionConstants';

// Initial state
const initialState = {
  canCreateStreams: true,
  crossRealmBots: [],
  twentyFourHourTime: false,
  emoji: {},
  filters: [],
  isAdmin: false,
  nonActiveUsers: [],
};

const convertRealmEmoji = (data): RealmEmojiById => {
  const emojis = {};
  Object.keys(data).forEach(id => {
    emojis[id] = { ...data[id], code: id.toString() };
  });
  return emojis;
};

export default (state: RealmState = initialState, action: Action): RealmState => {
  switch (action.type) {
    case ACCOUNT_SWITCH:
      return initialState;

    case REALM_INIT: {
      return {
        ...state,
        canCreateStreams: action.data.can_create_streams,
        crossRealmBots: action.data.cross_realm_bots,
        emoji: convertRealmEmoji(action.data.realm_emoji),
        filters: action.data.realm_filters,
        isAdmin: action.data.is_admin,
        nonActiveUsers: action.data.realm_non_active_users,
        twentyFourHourTime: action.data.twenty_four_hour_time,
      };
    }

    case LOGOUT:
    case LOGIN_SUCCESS:
      return {
        ...state,
        emoji: {},
      };

    case EVENT_REALM_FILTERS:
      return {
        ...state,
        filters: action.realm_filters,
      };

    case EVENT_REALM_EMOJI_UPDATE:
      return {
        ...state,
        emoji: convertRealmEmoji(action.realm_emoji),
      };

    case EVENT_UPDATE_DISPLAY_SETTINGS:
      switch (action.setting_name) {
        case 'twenty_four_hour_time':
          return { ...state, twentyFourHourTime: action.setting };
        default:
          return state;
      }

    default:
      return state;
  }
};
