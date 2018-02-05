/* @flow */
import { DRAFT_ADD, DRAFT_REMOVE } from '../actionConstants';

export const saveToDrafts = (narrow: string, content: string) => ({
  type: DRAFT_ADD,
  narrow,
  content,
});

export const deleteDraft = (narrow: string) => ({
  type: DRAFT_REMOVE,
  narrow,
});
