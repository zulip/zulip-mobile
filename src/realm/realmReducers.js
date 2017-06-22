/* @flow */
import { RealmState, Action } from '../types';
import {
  REALM_INIT,
  EVENT_REALM_EMOJI_UPDATE,
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  INIT_REALM_EMOJI,
  SAVE_TOKEN_GCM,
  DELETE_TOKEN_GCM,
} from '../actionConstants';

// Initial state
const initialState = {
  twentyFourHourTime: false,
  gcmToken: '',
  emoji: {},
};

const reducer = (state: RealmState = initialState, action: Action): RealmState => {
  switch (action.type) {
    case REALM_INIT:
      return {
        ...state,
        twentyFourHourTime: action.data.twenty_four_hour_time,
      };

    case ACCOUNT_SWITCH:
      return initialState;
    case SAVE_TOKEN_GCM: {
      return {
        ...state,
        gcmToken: action.gcmToken
      };
    }
    case DELETE_TOKEN_GCM: {
      return {
        ...state,
        gcmToken: ''
      };
    }
    case LOGOUT:
    case LOGIN_SUCCESS:
      return {
        ...state,
        emoji: {},
      };
    case INIT_REALM_EMOJI:
      return {
        ...state,
        emoji: action.emojis,
      };
    case EVENT_REALM_EMOJI_UPDATE:
      return {
        ...state,
        emoji: action.realm_emoji,
      };
    default:
      return state;
  }
};

export default reducer;
