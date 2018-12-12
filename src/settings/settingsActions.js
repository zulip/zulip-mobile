/* @flow strict-local */
import type { SettingsChangeAction, SettingsState } from '../types';
import { SETTINGS_CHANGE } from '../actionConstants';

export const settingsChange = (update: $Shape<SettingsState>): SettingsChangeAction => ({
  type: SETTINGS_CHANGE,
  update,
});
