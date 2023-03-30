/* @flow strict-local */
import type { AlertWordsState, PerAccountApplicableAction } from '../types';
import { REGISTER_COMPLETE, EVENT_ALERT_WORDS, RESET_ACCOUNT_DATA } from '../actionConstants';
import { NULL_ARRAY } from '../nullObjects';

const initialState = NULL_ARRAY;

export default (
  state: AlertWordsState = initialState, // eslint-disable-line default-param-last
  action: PerAccountApplicableAction,
): AlertWordsState => {
  switch (action.type) {
    case RESET_ACCOUNT_DATA:
      return initialState;

    case REGISTER_COMPLETE:
      return action.data.alert_words;

    case EVENT_ALERT_WORDS:
      return action.alert_words || initialState;

    default:
      return state;
  }
};
