/* @flow */
import type {
  AlertWordsState,
  AlertWordsAction,
  RealmInitAction,
  EventAlertWordsAction,
} from '../types';
import { REALM_INIT, INIT_ALERT_WORDS } from '../actionConstants';
import { NULL_ARRAY } from '../nullObjects';

const initialState = NULL_ARRAY;

const realmInit = (state: AlertWordsState, action: RealmInitAction): AlertWordsState =>
  action.data.alert_words || initialState;

const initAlertWords = (state: AlertWordsState, action: EventAlertWordsAction): AlertWordsState =>
  action.alertWords || initialState;

export default (
  state: AlertWordsState = initialState,
  action: AlertWordsAction,
): AlertWordsState => {
  switch (action.type) {
    case REALM_INIT:
      return realmInit(state, action);

    case INIT_ALERT_WORDS:
      return initAlertWords(state, action);

    default:
      return state;
  }
};
