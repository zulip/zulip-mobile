/* @flow */
import type { SettingsChangeAction } from '../types';
import { SETTINGS_CHANGE } from '../actionConstants';

export const settingsChange = (key: string, value: boolean | string): SettingsChangeAction => ({
  type: SETTINGS_CHANGE,
  key,
  value,
});
