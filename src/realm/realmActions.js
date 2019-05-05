/* @flow strict-local */
import type { InitialData, Action } from '../types';
import { REALM_INIT } from '../actionConstants';

export const realmInit = (data: InitialData): Action => ({
  type: REALM_INIT,
  data,
});
