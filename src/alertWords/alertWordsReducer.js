/* @flow */
import type { RealmState, Action } from '../types';
import { REALM_INIT, INIT_ALERT_WORDS } from '../actionConstants';

const initialState = {
  twentyFourHourTime: false,
  pushToken: {
    token: '',
    msg: '',
    result: '',
  },
  filters: [],
  emoji: {},
};

export default (state: RealmState = initialState, action: Action): RealmState => {
  switch (action.type) {
    case REALM_INIT:
      return action.data.alert_words || state;

    case INIT_ALERT_WORDS:
      return action.alertWords || state;

    default:
      return state;
  }
};
