/* @flow strict-local */
import type { Action, GlobalSettingsState } from '../types';
import { SET_GLOBAL_SETTINGS } from '../actionConstants';

export const setGlobalSettings = (update: $Shape<$Exact<GlobalSettingsState>>): Action => ({
  type: SET_GLOBAL_SETTINGS,
  update,
});
