import { SETTINGS_CHANGE } from '../constants';

export const settingsChange = (key: string, value: any) => ({
  type: SETTINGS_CHANGE,
  key,
  value,
});
