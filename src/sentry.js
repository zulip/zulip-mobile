/* @flow strict-local */

import config from './config';

if (config.sentryKey !== null) {
  /* TODO: replace Sentry initialization */
} else {
  // eslint-disable-next-line no-console
  console.log('skipping Sentry initialization');
}
