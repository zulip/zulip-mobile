/* @flow strict-local */
import type { AlertWordsState, PerAccountApplicableAction } from '../types';
import { REGISTER_COMPLETE, EVENT_ALERT_WORDS, ACCOUNT_SWITCH, LOGOUT } from '../actionConstants';
import { NULL_ARRAY } from '../nullObjects';

const initialState = NULL_ARRAY;

export default (
  state: AlertWordsState = initialState,
  action: PerAccountApplicableAction,
): AlertWordsState => {
  switch (action.type) {
    case LOGOUT:
    case ACCOUNT_SWITCH:
      return initialState;

    case REGISTER_COMPLETE:
      return action.data.alert_words || initialState;

    case EVENT_ALERT_WORDS:
      return action.alert_words || initialState;

    default:
      return state;
  }
};
