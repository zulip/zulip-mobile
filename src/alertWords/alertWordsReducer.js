/* @flow strict-local */
import type { AlertWordsState, Action } from '../types';
import { REALM_INIT, EVENT_ALERT_WORDS, ACCOUNT_SWITCH, LOGOUT } from '../actionConstants';
import { NULL_ARRAY } from '../nullObjects';

const initialState = NULL_ARRAY;

export default (state: AlertWordsState = initialState, action: Action): AlertWordsState => {
  switch (action.type) {
    case LOGOUT:
    case ACCOUNT_SWITCH:
      return initialState;

    case REALM_INIT:
      return action.data.alert_words || initialState;

    case EVENT_ALERT_WORDS:
      return action.alertWords || initialState;

    default:
      return state;
  }
};
