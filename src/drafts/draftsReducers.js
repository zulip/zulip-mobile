/* @flow */
import type { DraftState, Action } from '../types';
import { DRAFT_ADD, DRAFT_REMOVE, LOGOUT } from '../actionConstants';

const initialState = {};

const reducer = (state: DraftState = initialState, action: Action): DraftState => {
  switch (action.type) {
    case DRAFT_ADD:
      return state[action.narrow] === action.content
        ? state
        : { ...state, [action.narrow]: action.content };
    case DRAFT_REMOVE:
      return !state[action.narrow]
        ? state
        : Object.keys(state).reduce((result, key) => {
            if (key === action.narrow) {
              return result;
            }
            result[key] = action.content;
            return result;
          }, {});
    case LOGOUT: {
      return initialState;
    }
    default:
      return state;
  }
};

export default reducer;
