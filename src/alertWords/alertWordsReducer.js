/* @flow strict-local */
import type { AlertWordsState, Action } from '../types';
import { REALM_INIT, INIT_ALERT_WORDS } from '../actionConstants';
import { NULL_ARRAY } from '../nullObjects';

const initialState = NULL_ARRAY;

const realmInit = (state, action) => action.data.alert_words || initialState;

const initAlertWords = (state, action) => action.alertWords || initialState;

export default (state: AlertWordsState = initialState, action: Action): AlertWordsState => {
  switch (action.type) {
    case REALM_INIT:
      return realmInit(state, action);

    case INIT_ALERT_WORDS:
      return initAlertWords(state, action);

    default:
      return state;
  }
};
