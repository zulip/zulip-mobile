/* @flow strict-local */
import { Sentry } from 'react-native-sentry';

import config from './config';

if (config.enableSentry) {
  Sentry.config(config.sentryKey, {
    deactivateStacktraceMerging: true,
    ignoreErrors: ['Network request failed'],
  }).install();
}
