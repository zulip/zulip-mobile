/* @flow strict-local */
import type { AccountIndependentAction, GlobalSettingsState } from '../types';
import { SET_GLOBAL_SETTINGS } from '../actionConstants';

export const setGlobalSettings = (
  update: $Shape<$Exact<GlobalSettingsState>>,
): AccountIndependentAction => ({
  type: SET_GLOBAL_SETTINGS,
  update,
});
