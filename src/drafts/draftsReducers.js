/* @flow */
import type { DraftState, DraftsAction, DraftUpdateAction } from '../types';
import { DRAFT_UPDATE, LOGOUT } from '../actionConstants';
import { NULL_OBJECT } from '../nullObjects';

const initialState = NULL_OBJECT;

const draftUpdate = (state: DraftState, action: DraftUpdateAction): DraftState => {
  const narrowStr = JSON.stringify(action.narrow);
  const shouldDeleteDraft = action.content.trim().length === 0;

  // no need to update state
  if (state[narrowStr] === action.content) {
    return state;
  }

  // no data exists, no need to delete anything
  if (shouldDeleteDraft && !state[narrowStr]) {
    return state;
  }

  // if empty string, remove from state
  if (shouldDeleteDraft) {
    const newState = { ...state };
    delete newState[narrowStr];
    return newState;
  }

  // new state with content mapped to the narrow
  return {
    ...state,
    [narrowStr]: action.content,
  };
};

export default (state: DraftState = initialState, action: DraftsAction): DraftState => {
  switch (action.type) {
    case LOGOUT:
      return initialState;

    case DRAFT_UPDATE:
      return draftUpdate(state, action);

    default:
      return state;
  }
};
