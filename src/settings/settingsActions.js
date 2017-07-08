/* @flow */
import type { Actions } from '../types';
import { SETTINGS_CHANGE } from '../actionConstants';

export const settingsChange = (key: string, value: any): Actions => ({
  type: SETTINGS_CHANGE,
  key,
  value,
});
