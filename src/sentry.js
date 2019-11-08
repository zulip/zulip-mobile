/* @flow strict-local */
import * as Sentry from '@sentry/react-native';

import config from './config';

Sentry.init({
  dsn: config.sentryKey,
  deactivateStacktraceMerging: true,
  ignoreErrors: ['Network request failed'],
});

// This is normal behavior when running locally; only buiSlds shipped to the
// storefronts will have a Sentry key.
if (config.sentryKey === null) {
  // eslint-disable-next-line no-console
  console.log('no Sentry key provided; null init performed');
}
