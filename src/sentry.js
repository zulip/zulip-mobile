/* @flow strict-local */
import * as Sentry from '@sentry/react-native';
import config from './config';

/** Initialize Sentry into its default configuration. */
const initSentry = () => {
  const key = config.sentryKey;
  if (key !== null) {
    // The DSN is formatted as an `https:` URL. Omit the scheme.
    const displayKey = `${key.slice(8, 12)}......`;
    // eslint-disable-next-line no-console
    console.log(`Sentry key ${displayKey} provided; initializing`);

    Sentry.init({
      dsn: key,
      ignoreErrors: ['Network request failed'],
    });
  } else {
    // This is normal behavior when running locally; only published release
    // builds will have a Sentry key.

    // (It's not documented anywhere what happens when functions on Sentry are
    // called without first initializing Sentry. Fortunately, it seems to have
    // worked without warnings, so far.)

    // eslint-disable-next-line no-console
    console.log('no Sentry key provided; skipping initialization');
  }
};

initSentry();
