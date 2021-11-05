/* @flow strict-local */
import type { Narrow, PerAccountAction } from '../types';
import { DRAFT_UPDATE } from '../actionConstants';

export const draftUpdate = (narrow: Narrow, content: string): PerAccountAction => ({
  type: DRAFT_UPDATE,
  narrow,
  content,
});
