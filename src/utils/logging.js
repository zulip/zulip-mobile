/* @flow strict-local */
import { Sentry, SentrySeverity } from 'react-native-sentry';

import type { ErrorLog } from '../types';
import config from '../config';

export const errorList: ErrorLog[] = [];

export const logErrorRemotely = (e: Error, msg: ?string) => {
  if (config.enableSentry) {
    Sentry.captureException(e);
  }
  if (config.enableErrorConsoleLogging) {
    console.log(msg || '', e); // eslint-disable-line
  }
};

export const logErrorLocally = (error: Error, msg: string = '', isHandled = true): void => {
  errorList.push({
    timeStamp: Date.now(),
    error,
    isHandled,
  });
};

export const logError = (e: Error, msg: ?string) => {
  logErrorRemotely(e, msg);
  logErrorLocally(e, msg);
};

export const logWarningToSentry = (msg: string) => {
  if (config.enableSentry) {
    Sentry.captureMessage(msg, {
      level: SentrySeverity.Warning,
    });
  }
};

global.ErrorUtils.setGlobalHandler((e, isFatal) => {
  console.log('@@@ ERRROR', e);
  logError(e, false);
});

// console.error = (message, error) => global.ErrorUtils.reportError(error); // sending console.error so that it can be caught
