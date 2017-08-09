/* @flow */
import type { RealmState, Action } from '../types';
import { MESSAGE_SEND, EVENT_NEW_MESSAGE } from '../actionConstants';

const initialState = [];

const reducer = (state: RealmState = initialState, action: Action): RealmState => {
  switch (action.type) {
    case MESSAGE_SEND:
      return [...initialState, { ...action.params }];
    case EVENT_NEW_MESSAGE: {
      const newState = state.filter(item => item.localMessageId === action.localMessageId);
      return newState.length === state.length ? state : newState;
    }
    default:
      return state;
  }
};

export default reducer;
