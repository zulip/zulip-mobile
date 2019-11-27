/* @flow strict-local */
import * as Sentry from '@sentry/react-native';

import config from './config';

if (config.sentryKey !== null) {
  Sentry.init({
    dsn: config.sentryKey,
    ignoreErrors: ['Network request failed'],
  });
} else {
  // eslint-disable-next-line no-console
  console.log('skipping Sentry initialization');
}
