/* @flow */
import type { RealmState, Action } from '../types';
import { INIT_ALERT_WORDS } from '../actionConstants';

// Initial state
const initialState = [];

const reducer = (state: RealmState = initialState, action: Action): RealmState => {
  switch (action.type) {
    case INIT_ALERT_WORDS:
      return action.alertWords;
    default:
      return state;
  }
};

export default reducer;
