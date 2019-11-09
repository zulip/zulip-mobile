/* @flow strict-local */
import * as Sentry from '@sentry/react-native';
import type { Options } from '@sentry/react-native';

import config from './config';

/** Initialize Sentry, possibly into a disabled state. */
//
// There appears to be exactly one line of official documentation about
// initializing Sentry into a disabled state:
//
// https://docs.sentry.io/development/sdk-dev/overview/#usage-for-end-users
// > If an empty DSN is passed, you should treat it as valid option which
// > signifies disabling the SDK.
//
// Unfortunately, this is not actually documentation for our SDK; it's advice to
// developers of individual languages' Sentry SDKs about what end-users should
// see. In particular:
//  * The TypeScript type declarations for the JavaScript family of SDKs [1]
//    define the the Options struct as having `dsn?: string`, disallowing
//    `null`.
//  * If you ignore that and pass in `null` anyway, the Sentry Java SDK (used
//    under the hood on Android) treats a null or empty DSN as worthy of
//    warning.
//
// Fortunately, there is also an almost-undocumented `enabled?: boolean` option
// [2] available to us. The combination of an invalid DSN and `enabled: false`
// is not documented, but has not been observed to have ill effects.
//
// (A note for future work:
//
//   A comment by a developer [3] indicates that `enabled` can even be altered
//   at runtime, but this is not to be done blindly. As described, that _will_
//   disable Sentry; but initializing it in a disabled state and enabling it
//   afterwards will leave Sentry's integrations uninitialized. [4]
//
//   A better method may be to call `init()` again, even though the "Static API"
//   documentation [5] says this is undefined. A still-better method might be to
//   disregard the "Static API" and use `getCurrentHub()` everywhere.)

// [1] https://github.com/getsentry/sentry-javascript/blob/7a792f4e/packages/types/src/options.ts#L25
// [2] https://github.com/getsentry/sentry-javascript/blob/7a792f4e/packages/types/src/options.ts#L19
// [3] https://github.com/getsentry/sentry-javascript/issues/2039#issuecomment-486674574
// [4] https://github.com/getsentry/sentry-javascript/blob/7a792f4e/packages/core/src/baseclient.ts#L76
// [5] https://docs.sentry.io/development/sdk-dev/unified-api/#static-api

Sentry.init({
  enabled: config.sentryKey === null,
  dsn: config.sentryKey ?? 'none',
  ignoreErrors: ['Network request failed'],
});

// This is normal behavior when running locally; only published release builds
// will have a Sentry key.
if (config.sentryKey === null) {
  // eslint-disable-next-line no-console
  console.log('no Sentry key provided; disabling');
}

/** True if the Sentry SDK is currently (believed to be) enabled. */
export const isEnabled = () => {
  // Documented by the TypeScript types as possibly `undefined`. (In practice
  // this appears to be undefined iff `init` has not yet been successfully
  // called.)
  const client = Sentry.getCurrentHub().getClient();
  if (!client) {
    return false;
  }

  // The `ClientBase` class defines a (protected) `_isEnabled()` function.
  // https://github.com/getsentry/sentry-javascript/blob/7a792f4e/packages/core/src/baseclient.ts#L240
  // This is copied from there (modulo irrelevant details).
  const options: Options = client.getOptions();
  return options.enabled !== false && options.dsn !== undefined;
};
