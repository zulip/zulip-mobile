/* @flow strict-local */
import type { InitialData, Action } from '../types';
import { REGISTER_COMPLETE } from '../actionConstants';

export const registerComplete = (data: InitialData): Action => ({
  type: REGISTER_COMPLETE,
  data,
});
