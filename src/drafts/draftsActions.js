/* @flow */
import type { GetState, Narrow, DraftAddAction, DraftRemoveAction } from '../types';
import { DRAFT_ADD, DRAFT_REMOVE } from '../actionConstants';

export const draftAdd = (narrow: Narrow, content: string): DraftAddAction => ({
  type: DRAFT_ADD,
  narrow,
  content,
});

export const draftRemove = (narrow: Narrow): DraftRemoveAction => ({
  type: DRAFT_REMOVE,
  narrow,
});

export const updateDraft = (narrow: Narrow, message: string) => (
  dispatch: Dispatch,
  getState: GetState,
) => {
  if (message.trim().length === 0) {
    dispatch(draftRemove(narrow));
  } else {
    dispatch(draftAdd(narrow, message));
  }
};
