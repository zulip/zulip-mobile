/* @flow */
import type { RealmState, Action } from '../types';
import {
  APP_REFRESH,
  REALM_INIT,
  EVENT_REALM_EMOJI_UPDATE,
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  INIT_REALM_EMOJI,
  EVENT_UPDATE_DISPLAY_SETTINGS,
  SAVE_TOKEN_PUSH,
  DELETE_TOKEN_PUSH,
  INIT_REALM_FILTER,
  EVENT_REALM_FILTER_UPDATE,
} from '../actionConstants';

// Initial state
const initialState = {
  twentyFourHourTime: false,
  pushToken: { token: '', result: '', msg: '' },
  emoji: {},
  filters: [],
};

export default (state: RealmState = initialState, action: Action): RealmState => {
  switch (action.type) {
    case REALM_INIT:
      return {
        ...state,
        emoji: action.data.realm_emoji,
        filters: action.data.realm_filters,
        twentyFourHourTime: action.data.twenty_four_hour_time,
      };

    case APP_REFRESH:
    case ACCOUNT_SWITCH:
      return initialState;

    case SAVE_TOKEN_PUSH: {
      return {
        ...state,
        pushToken: {
          token: action.pushToken,
          result: action.result,
          msg: action.msg,
        },
      };
    }

    case DELETE_TOKEN_PUSH: {
      return {
        ...state,
        pushToken: { token: '', result: '', msg: '' },
      };
    }

    case LOGOUT:
    case LOGIN_SUCCESS:
      return {
        ...state,
        emoji: {},
        pushToken: { token: '', result: '', msg: '' },
      };

    case INIT_REALM_EMOJI:
      return {
        ...state,
        emoji: action.emojis,
      };

    case INIT_REALM_FILTER: {
      return {
        ...state,
        filters: action.filters,
      };
    }

    case EVENT_REALM_FILTER_UPDATE: {
      return {
        ...state,
        filters: action.realm_filters,
      };
    }

    case EVENT_REALM_EMOJI_UPDATE:
      return {
        ...state,
        emoji: action.realm_emoji,
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
