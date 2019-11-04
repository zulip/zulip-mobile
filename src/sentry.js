/* @flow strict-local */
import * as Sentry from '@sentry/react-native';

import config from './config';

if (config.sentryKey.startsWith('https')) {
  Sentry.init({
    dsn: config.sentryKey,
    deactivateStacktraceMerging: true,
    ignoreErrors: ['Network request failed'],
  });
} else {
  // eslint-disable-next-line no-console
  console.log('skipping Sentry initialization');
}
