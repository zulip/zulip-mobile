/* @flow strict-local */
import type { RealmState, Action } from '../types';
import {
  REALM_INIT,
  EVENT_REALM_EMOJI_UPDATE,
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  INIT_REALM_EMOJI,
  EVENT_UPDATE_DISPLAY_SETTINGS,
  INIT_REALM_FILTER,
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

const realmInit = (state, action) => ({
  ...state,
  canCreateStreams: action.data.can_create_streams,
  crossRealmBots: action.data.cross_realm_bots,
  emoji: action.data.realm_emoji,
  filters: action.data.realm_filters,
  isAdmin: action.data.is_admin,
  nonActiveUsers: action.data.realm_non_active_users,
  twentyFourHourTime: action.data.twenty_four_hour_time,
});

const loginChange = (state, action) => ({
  ...state,
  emoji: {},
});

const initRealmEmoji = (state, action) => ({
  ...state,
  emoji: action.emojis,
});

const initRealmFilter = (state, action) => ({
  ...state,
  filters: action.filters,
});

const eventRealmFilters = (state, action) => ({
  ...state,
  filters: action.realm_filters,
});

const eventRealmEmojiUpdate = (state, action) => ({
  ...state,
  emoji: action.realm_emoji,
});

export default (state: RealmState = initialState, action: Action): RealmState => {
  switch (action.type) {
    case ACCOUNT_SWITCH:
      return initialState;

    case REALM_INIT:
      return realmInit(state, action);

    case LOGOUT:
    case LOGIN_SUCCESS:
      return loginChange(state, action);

    case INIT_REALM_EMOJI:
      return initRealmEmoji(state, action);

    case INIT_REALM_FILTER:
      return initRealmFilter(state, action);

    case EVENT_REALM_FILTERS:
      return eventRealmFilters(state, action);

    case EVENT_REALM_EMOJI_UPDATE:
      return eventRealmEmojiUpdate(state, action);

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
