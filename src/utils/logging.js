/* @flow */
import { Sentry, SentrySeverity } from 'react-native-sentry';
import config from '../config';

export const logErrorRemotely = (e: Error, msg: string) => {
  Sentry.captureException(e);
  if (config.enableErrorConsoleLogging) console.log(msg || '', e); // eslint-disable-line
};

export const logWarningToSentry = (msg: string) => {
  Sentry.captureMessage(msg, {
    level: SentrySeverity.Warning,
  });
};
