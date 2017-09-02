/* @flow */
import { DRAFT_ADD, DRAFT_REMOVE } from '../actionConstants';
import type { Draft } from '../types';

export const saveToDrafts = (narrow: string, content: string) => ({
  type: DRAFT_ADD,
  narrow,
  content,
});

export const deleteDraft = (draft: Draft) => ({
  type: DRAFT_REMOVE,
  draft,
});
