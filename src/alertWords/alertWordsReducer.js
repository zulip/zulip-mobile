/* @flow strict-local */
import type { AlertWordsState, PerAccountApplicableAction } from '../types';
import { REGISTER_COMPLETE, EVENT_ALERT_WORDS, ACCOUNT_SWITCH, LOGOUT } from '../actionConstants';
import { NULL_ARRAY } from '../nullObjects';

const initialState = NULL_ARRAY;

export default (
  state: AlertWordsState = initialState, // eslint-disable-line default-param-last
  action: PerAccountApplicableAction,
): AlertWordsState => {
  switch (action.type) {
    case LOGOUT:
    case ACCOUNT_SWITCH:
      return initialState;

    case REGISTER_COMPLETE:
      return (
        action.data.alert_words
        // TODO(#5102): Delete fallback once we enforce any threshold for
        //   ancient servers we refuse to connect to. It was added in #2878
        //   (2018-11-16), but it wasn't clear even then, it seems, whether
        //   any servers actually omit the data. The API doc doesn't mention
        //   any servers that omit it, and our Flow types mark it required.
        || initialState
      );

    case EVENT_ALERT_WORDS:
      return action.alert_words || initialState;

    default:
      return state;
  }
};
