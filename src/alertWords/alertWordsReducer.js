/* @flow */
import type { RealmState, Action } from '../types';
import { REALM_INIT, INIT_ALERT_WORDS } from '../actionConstants';
import { NULL_ARRAY } from '../nullObjects';

const initialState = NULL_ARRAY;

export default (state: RealmState = initialState, action: Action): RealmState => {
  switch (action.type) {
    case REALM_INIT:
      return action.data.alert_words;

    case INIT_ALERT_WORDS:
      return action.alertWords;

    default:
      return state;
  }
};
