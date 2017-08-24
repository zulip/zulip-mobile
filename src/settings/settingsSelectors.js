/* @flow */
import { createSelector } from 'reselect';
import { getSettings } from '../selectors';

export const getLocale = createSelector(getSettings, settings => settings.locale);

export const getTheme = createSelector(getSettings, settings => settings.theme);

export const getOnlineNotification = createSelector(
  getSettings,
  settings => settings.onlineNotification,
);

export const getOfflineNotification = createSelector(
  getSettings,
  settings => settings.offlineNotification,
);
