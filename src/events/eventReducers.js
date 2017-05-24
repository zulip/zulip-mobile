/* @flow */
import { StateType, Action } from '../types';
import {
  ACCOUNT_SWITCH,
  EVENT_REGISTERED,
  LOGOUT,
} from '../actionConstants';

const initialState = {
  queueId: null,
};

export default (state: StateType = initialState, action: Action) => {
  switch (action.type) {
    case ACCOUNT_SWITCH:
    case LOGOUT:
      return initialState;
    case EVENT_REGISTERED:
      return {
        ...state,
        queueId: action.queueId,
      };
    default:
      return state;
  }
};
