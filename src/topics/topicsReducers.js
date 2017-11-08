/* @flow */
import { Action, TopicsState } from '../types';
import { ACCOUNT_SWITCH, INIT_TOPICS } from '../actionConstants';
import { NULL_OBJECT } from '../nullObjects';

const initialState: TopicsState = NULL_OBJECT;

export default (state: TopicsState = initialState, action: Action) => {
  switch (action.type) {
    case INIT_TOPICS:
      return {
        ...state,
        [action.streamId]: action.topics,
      };

    case ACCOUNT_SWITCH:
      return initialState;

    default:
      return state;
  }
};
