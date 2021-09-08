/* @flow strict-local */

/**
 * The Sentry "client key" aka "DSN".
 *
 * When non-null, this is the destination we send Sentry events to.
 * When null, the app does not send anything to Sentry.
 *
 * For more on the meaning of this value, see Sentry upstream docs:
 *   https://docs.sentry.io/platforms/react-native/configuration/options/#dsn
 *   https://docs.sentry.io/product/sentry-basics/dsn-explainer/
 */
// The published official builds of the Zulip mobile app contain a non-null
// value here.  Because the key is there in those published builds, it's
// fundamentally not a secret.
//
// But it's important to make sure Zulip developers and people distributing
// their own modified versions of the app don't accidentally end up sending
// Sentry events that get mixed in amongst events from the official builds:
// https://github.com/getsentry/sentry-docs/pull/1723#issuecomment-773479895
// So we keep the key out of the public source tree, to ensure there's no
// way to accidentally start using it.
//
// If you're making your own builds and want to use Sentry with them, please
// create your own Sentry client key / DSN, and fill it in here.
// See also the comment in AndroidManifest.xml about `io.sentry.dsn`.
export const sentryKey: string | null = null;
