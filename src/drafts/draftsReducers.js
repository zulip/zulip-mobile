/* @flow */
import type { DraftState, DraftsAction, DraftAddAction, DraftRemoveAction } from '../types';
import { DRAFT_ADD, DRAFT_REMOVE, LOGOUT } from '../actionConstants';
import { NULL_OBJECT } from '../nullObjects';

const initialState = NULL_OBJECT;

const draftAdd = (state: DraftState, action: DraftAddAction): DraftState => {
  const narrowStr = JSON.stringify(action.narrow);
  return state[narrowStr] === action.content ? state : { ...state, [narrowStr]: action.content };
};

const draftRemove = (state: DraftState, action: DraftRemoveAction): DraftState => {
  const narrowStr = JSON.stringify(action.narrow);

  if (!state[narrowStr]) {
    return state;
  }

  const newState = { ...state };
  delete newState[narrowStr];
  return newState;
};

export default (state: DraftState = initialState, action: DraftsAction): DraftState => {
  switch (action.type) {
    case LOGOUT:
      return initialState;

    case DRAFT_ADD:
      return draftAdd(state, action);

    case DRAFT_REMOVE:
      return draftRemove(state, action);

    default:
      return state;
  }
};
