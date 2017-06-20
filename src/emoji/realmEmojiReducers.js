/* @flow */
import { StateType, Action } from '../types';
import {
  EVENT_REALM_EMOJI_UPDATE,
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
} from '../actionConstants';

const initialState = {
  realm_emoji: {},
};

export default (state: StateType = initialState, action:Action) => {
  switch (action.type) {
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return initialState;
    case EVENT_REALM_EMOJI_UPDATE:
      return {
        realm_emoji: action.realm_emoji,
      };
    default:
      return state;
  }
};
