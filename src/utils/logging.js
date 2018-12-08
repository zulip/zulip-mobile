/* @flow strict-local */
import { Sentry, SentrySeverity } from 'react-native-sentry';
import config from '../config';

export const logErrorRemotely = (e: Error, msg: ?string) => {
  if (config.enableSentry) {
    Sentry.captureException(e);
  }
  if (config.enableErrorConsoleLogging) {
    console.log(msg || '', e); // eslint-disable-line
  }
};

export const logWarningToSentry = (msg: string) => {
  if (config.enableSentry) {
    Sentry.captureMessage(msg, {
      level: SentrySeverity.Warning,
    });
  }
};
