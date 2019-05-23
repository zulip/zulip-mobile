/* @flow strict-local */
import { Sentry } from 'react-native-sentry';

import config from './config';

if (config.enableSentry) {
  Sentry.config(config.sentryKey, {
    deactivateStacktraceMerging: true,
    ignoreErrors: ['Network request failed'],
  }).install();
}

export const sentrySetUsername = (username?: string) => {
  if (username !== undefined && username.length > 0) {
    // set username field to be reported by Sentry
    Sentry.setUserContext({
      username,
    });
  } else {
    // clear user context completely
    Sentry.setUserContext();
  }
};
