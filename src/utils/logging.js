/* @flow strict-local */
import type { Scope, SeverityType, EventHint } from '@sentry/react-native';
import {
  getCurrentHub,
  configureScope,
  Severity,
  withScope as withScopeImpl,
} from '@sentry/react-native';

import type { ZulipVersion } from './zulipVersion';
import type { JSONable } from './jsonable';
import objectEntries from './objectEntries';
import config from '../config';

/** Type of "extras" intended for Sentry. */
type Extras = {| +[key: string]: JSONable |};

/** Wrapper for `Sentry.withScope`, allowing callbacks to return values. */
function withScope<R>(callback: Scope => R): R {
  let ret: R;
  withScopeImpl(scope => {
    ret = callback(scope);
  });
  // Flow can't know that `ret` has actually been initialized
  return ((ret: $FlowFixMe): R);
}

type ServerVersionTags = {|
  rawServerVersion: string | void,
  coarseServerVersion: string | void,
  fineServerVersion: string | void,
|};

/**
 * Get server-version tags at various levels of granularity.
 *
 * If the passed server version is falsy, all the tags will be
 * `undefined`.
 */
const getServerVersionTags = (zulipVersion: ?ZulipVersion): ServerVersionTags => {
  // Why might we not have the server version? If there's no active
  // account. N.B: an account may be the active account but not
  // logged in; see
  // https://github.com/zulip/zulip-mobile/blob/v27.158/docs/glossary.md#active-account.
  if (!zulipVersion) {
    return {
      rawServerVersion: undefined,
      coarseServerVersion: undefined,
      fineServerVersion: undefined,
    };
  }

  const raw = zulipVersion.raw();

  const OMITTED = 'x';
  const UNKNOWN = '?';

  const elements = zulipVersion.elements();
  const major = elements.major ?? UNKNOWN;
  const minor = elements.minor ?? UNKNOWN;
  const patch = elements.patch ?? UNKNOWN;

  let coarseServerVersion = undefined;
  let fineServerVersion = undefined;
  // Effective with 3.0, we changed our numbering conventions; 3.x and
  // 4.x are each the same level of granularity as 2.1.x or 2.0.x.
  if (zulipVersion.isAtLeast('3.0')) {
    coarseServerVersion = [major, OMITTED].join('.');
    fineServerVersion = [major, minor].join('.');
  } else {
    coarseServerVersion = [major, minor, OMITTED].join('.');
    fineServerVersion = [major, minor, patch].join('.');
  }

  return { rawServerVersion: raw, coarseServerVersion, fineServerVersion };
};

export function setTagsFromServerVersion(zulipVersion: ?ZulipVersion) {
  configureScope(scope => {
    // Set server version tags on Sentry's global scope, so
    // all events will have them. See
    // https://docs.sentry.io/platforms/javascript/enriching-events/tags/
    // for more about Sentry tags.
    //
    // If `zulipVersion` is falsy, all values in the object
    // passed to `setTags` will be undefined. This means the
    // tags will be removed from the scope, though this is
    // unofficial as a way to remove tags:
    //   https://github.com/getsentry/sentry-javascript/pull/3108#issue-534072956
    scope.setTags(getServerVersionTags(zulipVersion));
  });
}

/**
 * Log an event (a string or Error) at some arbitrary severity.
 *
 * The error will be logged to Sentry, including a stack trace. The stack trace
 * is taken from `err` if an `Error` object, and otherwise synthesized from the
 * call site.
 *
 * Returns a Sentry event_id, although this is not expected to be useful.
 */
const logToSentry = (event: string | Error, level: SeverityType, extras: Extras): string => {
  let message: string;
  let hint: EventHint;

  if (event instanceof Error) {
    // eslint-disable-next-line prefer-destructuring
    message = event.message;
    hint = { originalException: event };
  } else {
    // Synthesize the event's stack trace. (The static API does this for us, at
    // least sometimes; but we're calling in at one level lower.)
    message = event;
    try {
      throw new Error(event);
    } catch (err) {
      hint = { syntheticException: err };
    }
  }

  return withScope(scope => {
    scope.setExtras(extras);

    // The static API's `captureException` doesn't allow passing strings, and its
    // counterpart `captureMessage` doesn't allow passing stacktraces.
    // Fortunately, the quasi-internal "Hub" API exists, and is reasonably
    // well-documented:
    //
    // https://docs.sentry.io/development/sdk-dev/unified-api/#hub
    //
    // (There is a `captureEvent` method that allows both explicitly; but it also
    // expects a great deal of other information which we would have to
    // synthesize, and which has no user-facing documentation.)
    return getCurrentHub().captureMessage(message, level, hint);
  });
};

type LogParams = {|
  consoleMethod: mixed => void,
  severity: SeverityType,
|};
type LogFunction = (event: string | Error, extras?: Extras) => void;

const makeLogFunction = ({ consoleMethod, severity }: LogParams): LogFunction => {
  const toConsole = consoleMethod.bind(console);

  return (event: string | Error, extras: Extras = {}) => {
    logToSentry(event, severity, extras);

    if (config.enableErrorConsoleLogging) {
      toConsole(event);

      const data = objectEntries(extras)
        .map(([key, value]) => `    ${key}: ${JSON.stringify(value)}`)
        .join('\n');

      if (data) {
        toConsole(data);
      }
    }
  };
};

/* eslint-disable no-console */

// Notes on the behavior of `console.error`, `console.warn`, `console.log`:
//
// * When debugging JS: all display in the Chrome dev console, and not in
//   the Android system log.
//   * `error` and `warn` produce a nice expando-hidden stack trace, in
//     addition to formatting their arguments.
//   * `log` just formats the arguments.
//   * An `Error` argument formats with its embedded stack trace.  (As just
//     text, with no spiffy expando.)
//
// * In a debug build, whether debugging JS or not:
//   * `error` pops up the RN error red-screen.
//   * `warn` could pop up an RN yellow-box, but we've set
//     `console.disableYellowBox` so it doesn't.
//
// * On Android, on both debug and release builds, except when debugging JS:
//   * All of `error`, `warn`, `log` go to the system log (for `adb logcat`).
//   * An `Error` argument formats with (the name + message and) just the
//     single source location where it was created, no stack trace.

/**
 * Log an error at "error" severity.
 *
 * The error will be logged to Sentry and/or the console as appropriate.
 *
 * In a debug build, this pops up the RN error red-screen.  This is
 * appropriate when the condition should never happen and definitely
 * represents a bug.  For conditions that can happen without a bug (e.g. a
 * failure to reach the server), consider `logging.warn`.
 *
 * See also:
 *  * `logging.warn` for logging at lower severity
 *
 * @param event A string describing the nature of the event to be logged, or an
 *   exception whose `.message` is such a string. Related events should have
 *   identical such strings, when feasible.
 * @param extras Diagnostic data which may differ between separate occurrences
 *   of the event.
 */
export const error: (event: string | Error, extras?: Extras) => void = makeLogFunction({
  consoleMethod: console.error,
  severity: Severity.Error,
});

/**
 * Log an event at "warning" severity.
 *
 * The event will be logged to Sentry and/or the console as appropriate.
 *
 * In the JS debugging console, this produces a yellow-highlighted warning,
 * but no popup interruption.  This makes it appropriate for conditions
 * which have an inevitable background rate.  For conditions which
 * definitely represent a bug in the app, consider `logging.error` instead.
 *
 * See also:
 *  * `logging.error` for logging at higher severity
 *
 * @param event A string describing the nature of the event to be logged, or an
 *   exception whose `.message` is such a string. Related events should have
 *   identical such strings, when feasible.
 * @param extras Diagnostic data which may differ between separate occurrences
 *   of the event.
 */
export const warn: (event: string | Error, extras?: Extras) => void = makeLogFunction({
  consoleMethod: console.warn,
  severity: Severity.Warning,
});
