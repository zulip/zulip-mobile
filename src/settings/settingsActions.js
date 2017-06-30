/* @flow */
import { SETTINGS_CHANGE } from '../actionConstants';

export const settingsChange = (key: string, value: any) => ({
  type: SETTINGS_CHANGE,
  key,
  value,
});
