/* @flow strict-local */
import * as Sentry from '@sentry/react-native';
import { nativeApplicationVersion } from 'expo-application';

import { sentryKey } from './sentryConfig';

export const isSentryActive = (): boolean => {
  // Hub#getClient() is documented as possibly returning undefined, but the
  // significance of `undefined` is not. In practice, it appears to be
  // `undefined` exactly when `Sentry.init()` has not yet been called.
  const client = Sentry.getCurrentHub().getClient();

  /* The `enabled` option in getOptions() is theoretically togglable at runtime:
     https://github.com/getsentry/sentry-javascript/issues/2039#issuecomment-486674574
     We avoid this, however, as it will only toggle the JavaScript SDK and not
     the lower-level native-code SDKs. */
  // return (client && client.getOptions().enabled) ?? false;

  return !!client;
};

const preventNoise = (): void => {
  /* Sentry should not normally be used in debug mode. (For one thing, the
     debug-mode build process doesn't ordinarily create bundles or .map files,
     so you'll probably get nonsensical stack traces.) */
  if (process.env.NODE_ENV === 'development' && sentryKey !== null) {
    /* If you have some reason to initialize Sentry in debug mode anyway, please
       change the app's version name (currently specified in `ios/Info.plist`
       and/or `android/app/build.gradle`) to something that doesn't look like a
       normal version number -- preferably with your name and/or Github ID in
       it. This will allow events produced by these debug builds to be easily
       identified in the Sentry console. */
    if (nativeApplicationVersion !== null && nativeApplicationVersion.match(/^\d+\.\d+\.\d+$/)) {
      throw new Error('Sentry should not be initialized in debug builds');
    }
  }

  /* Jest has no reason to even _try_ to initialize Sentry, even if `sentryKey`
     is `null`. */
  // (See the following links concerning detecting Jest.)
  //   [1] https://jestjs.io/docs/en/24.0/getting-started.html#using-babel
  //   [2] https://stackoverflow.com/a/52231746
  if (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined) {
    throw new Error('Sentry must not be initialized during testing!');
  }
};

/** Initialize Sentry into its default configuration. */
export const initializeSentry = () => {
  // Check to make sure it's safe to run Sentry. Abort if not.
  preventNoise();

  const key = sentryKey;
  if (key !== null) {
    // The DSN is formatted as an `https:` URL. Omit the scheme.
    const displayKey = `${key.slice(8, 12)}......`;
    // eslint-disable-next-line no-console
    console.log(`Sentry key ${displayKey} provided; initializing`);

    Sentry.init({
      dsn: key,
      ignoreErrors: [
        // RN's fetch implementation can raise these; we sometimes mimic it
        'Network request failed',
      ],
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
