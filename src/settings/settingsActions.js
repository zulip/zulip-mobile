/* @flow strict-local */
import type { Action, GlobalSettingsState } from '../types';
import { SETTINGS_CHANGE } from '../actionConstants';

export const settingsChange = (update: $Shape<$Exact<GlobalSettingsState>>): Action => ({
  type: SETTINGS_CHANGE,
  update,
});
