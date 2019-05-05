/* @flow strict-local */
import type { Narrow, Action } from '../types';
import { DRAFT_UPDATE } from '../actionConstants';

export const draftUpdate = (narrow: Narrow, content: string): Action => ({
  type: DRAFT_UPDATE,
  narrow,
  content,
});
