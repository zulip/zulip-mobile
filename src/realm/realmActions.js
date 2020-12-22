/* @flow strict-local */
import type { InitialData, Action } from '../types';
import type { ZulipVersion } from '../utils/zulipVersion';
import { REALM_INIT } from '../actionConstants';

export const realmInit = (data: InitialData, zulipVersion: ZulipVersion): Action => ({
  type: REALM_INIT,
  data,
  zulipVersion,
});
