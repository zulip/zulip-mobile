/* @flow strict-local */
import type { Narrow, DraftUpdateAction } from '../types';
import { DRAFT_UPDATE } from '../actionConstants';

export const draftUpdate = (narrow: Narrow, content: string): DraftUpdateAction => ({
  type: DRAFT_UPDATE,
  narrow,
  content,
});
