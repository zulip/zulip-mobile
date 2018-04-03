/* @flow */
import type { Narrow, DraftAddAction, DraftRemoveAction } from '../types';
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
