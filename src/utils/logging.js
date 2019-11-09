/* @flow strict-local */
import type { SeverityType, EventHint } from '@sentry/react-native';
import { getCurrentHub, Severity } from '@sentry/react-native';

import config from '../config';

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
 * Log an event (a string or Error) at some arbitrary severity.
 *
 * The error will be logged to Sentry, including a stack trace. The stack trace
 * is taken from `err` if an `Error` object, and otherwise synthesized from the
 * call site.
 *
 * Returns a Sentry event_id, although this is not expected to be useful.
 */
const logToSentry = (event: string | Error, level: SeverityType): string => {
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
};

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
 *  * `logging.logToSentry` for logging at a custom severity
 */
export const error = (err: string | Error) => {
  logToSentry(err, Severity.Error);

  if (config.enableErrorConsoleLogging) {
    // See toplevel comment about behavior of `console` methods.
    console.error(err); // eslint-disable-line
  }
};

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
 *  * `logging.logToSentry` for logging at a custom severity
 */
export const warn = (event: string | Error) => {
  logToSentry(event, Severity.Warning);

  if (config.enableErrorConsoleLogging) {
    // See toplevel comment about behavior of `console` methods.
    console.warn(event); // eslint-disable-line
  }
};
