/* @flow */
import type { SettingsChangeAction } from '../types';
import { SETTINGS_CHANGE } from '../actionConstants';

export const settingsChange = (key: string, value: any): SettingsChangeAction => ({
  type: SETTINGS_CHANGE,
  key,
  value,
});
