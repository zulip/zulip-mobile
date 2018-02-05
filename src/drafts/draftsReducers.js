/* @flow */
import type { DraftState, Action } from '../types';
import { DRAFT_ADD, DRAFT_REMOVE, LOGOUT } from '../actionConstants';
import { NULL_OBJECT } from '../nullObjects';

const initialState = NULL_OBJECT;

export default (state: DraftState = initialState, action: Action): DraftState => {
  switch (action.type) {
    case LOGOUT:
      return initialState;

    case DRAFT_ADD:
      return state[action.narrow] === action.content
        ? state
        : { ...state, [action.narrow]: action.content };

    case DRAFT_REMOVE: {
      if (!state[action.narrow]) {
        return state;
      }
      const newState = { ...state };
      delete newState[action.narrow];
      return newState;
    }

    default:
      return state;
  }
};
