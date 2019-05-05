/* @flow strict-local */
import type { Action, SettingsState } from '../types';
import { SETTINGS_CHANGE } from '../actionConstants';

export const settingsChange = (update: $Shape<SettingsState>): Action => ({
  type: SETTINGS_CHANGE,
  update,
});
