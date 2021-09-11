/* @flow strict-local */
import * as Sentry from '@sentry/react-native';
import type { Breadcrumb, BreadcrumbHint } from '@sentry/react-native';
import { nativeApplicationVersion } from 'expo-application';
// $FlowFixMe[untyped-import]
import md5 from 'blueimp-md5';

import type { AccountStatus } from './account/accountsSelectors';
import isAppOwnDomain from './isAppOwnDomain';
import store from './boot/store';
import { getAccountStatuses } from './account/accountsSelectors';
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

/**
 * An HTTP request made by the app.
 *
 * One of the builtin "recognized breadcrumb types":
 *   https://develop.sentry.dev/sdk/event-payloads/breadcrumbs/#breadcrumb-types
 */
type HttpBreadcrumb = $ReadOnly<{|
  ...Breadcrumb,
  type: 'http',
  data: {|
    url?: string,
    method?: string,
    status_code?: number,
    reason?: string,
  |},
|}>;

function shouldScrubHost(url: URL, accountStatuses: $ReadOnlyArray<AccountStatus>) {
  if (isAppOwnDomain(url)) {
    return false;
  }

  if (url.pathname.startsWith('/api/v1')) {
    // Most likely an API request to a Zulip realm. This will catch
    // `/api/v1/server_settings` and `/api/v1/fetch_api_key` requests to a
    // realm before the account is added to the account-statuses state.
    return true;
  }

  if (accountStatuses.some(({ realm }) => url.origin === realm.origin)) {
    // Definitely a request to a Zulip realm. Will catch requests to realms
    // in the account-statuses state, including those without `/api/v1`,
    // like `/avatar/{user_id}` (zulip/zulip@0f9970fd3 confirms that this
    // and potentially others don't / won't use `/api/v1`).
    return true;
  }

  return false;
}

function scrubUrl(unscrubbedUrl: void | string): void | string {
  if (unscrubbedUrl === undefined) {
    return undefined;
  }

  const parsedUrl = new URL(unscrubbedUrl);
  const accountStatuses = getAccountStatuses(store.getState());
  if (!shouldScrubHost(parsedUrl, accountStatuses)) {
    return unscrubbedUrl;
  }

  parsedUrl.host = `hidden-${
    // So different realms are still distinguishable
    md5(parsedUrl.host).substring(0, 6)
  }.zulip.invalid`;
  return parsedUrl.toString();
}

/**
 * Scrubs possibly personal information from a breadcrumb.
 *
 * - Removes the realm hostnames in API requests, except if the realm is
 *   hosted by the organization that publishes the app and gets Sentry
 *   reports from the published app. That organization knows which realms it
 *   hosts and already has their server logs.
 */
function scrubBreadcrumb(breadcrumb: Breadcrumb, hint?: BreadcrumbHint): Breadcrumb {
  switch (breadcrumb.type) {
    case 'http': {
      // $FlowIgnore[incompatible-indexer] | We assume it's an
      // $FlowIgnore[incompatible-type]    | HttpBreadcrumb; see jsdoc.
      const httpBreadcrumb: HttpBreadcrumb = breadcrumb;
      return {
        ...httpBreadcrumb,
        data: {
          ...httpBreadcrumb.data,
          url: scrubUrl(httpBreadcrumb.data.url),
        },
      };
    }
    default:
      return breadcrumb;
  }
}

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
      beforeBreadcrumb(breadcrumb: Breadcrumb, hint?: BreadcrumbHint): Breadcrumb | null {
        try {
          return scrubBreadcrumb(breadcrumb, hint);
        } catch (_e) {
          const e: Error = _e; // For Flow's sake (we know it's an Error)

          // We don't expect any errors here. But:
          // - We can't just drop breadcrumbs on the floor, which is what
          //   would happen on an uncaught Error in `beforeBreadcrumb`. We'd
          //   lose valuable information, including the fact that there was
          //   supposed to be a breadcrumb in the first place.
          // - We shouldn't knowingly send an un-scrubbed breadcrumb.
          //
          // So, make a substitute breadcrumb with none of the real
          // breadcrumb's data, and include `e.message` from the scrubbing
          // error.
          //
          // We currently don't send a separate event for the scrubbing
          // error. It would be easy for that code to accidentally add a
          // breadcrumb of its own, starting an infinite loop if
          // `beforeBreadcrumb` fails on it too. And we mustn't break the
          // First Law of debuggers, which is that they not break the
          // program's normal functionality.

          // One of the builtin "recognized breadcrumb types":
          //   https://develop.sentry.dev/sdk/event-payloads/breadcrumbs/#breadcrumb-types
          return {
            type: 'error',
            category: 'error',
            level: 'error',
            message: `Breadcrumb scrub failed: ${e.message}`,
            timestamp: breadcrumb.timestamp,
          };
        }
      },
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
