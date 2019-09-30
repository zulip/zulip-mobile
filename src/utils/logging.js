/* @flow strict-local */
import { Sentry, SentrySeverity } from 'react-native-sentry';
import config from '../config';

export const logErrorRemotely = (e: Error, msg: ?string) => {
  if (config.enableSentry) {
    Sentry.captureException(e);
  }
  if (config.enableErrorConsoleLogging) {
    console.log(msg || '', e); // eslint-disable-line
  }
};

export const logWarningToSentry = (msg: string) => {
  if (config.enableSentry) {
    Sentry.captureMessage(msg, {
      level: SentrySeverity.Warning,
    });
  }
};

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
 * The error will be logged to Sentry and/or the console as appropriate,
 * including a stack trace.  The stack trace is taken from `err` if an
 * `Error` object, and otherwise from the call site.
 *
 * In a debug build, this pops up the RN error red-screen.  This is
 * appropriate when the condition should never happen and definitely
 * represents a bug.  For conditions that can happen without a bug (e.g. a
 * failure to reach the server), consider `logging.warn`.
 *
 * See also:
 *  * `logging.warn` for logging at lower severity
 */
export const error = (err: string | Error) => {
  if (config.enableSentry) {
    // If `err` is a string, this will dispatch to captureMessage and
    // synthesize a stack trace.
    Sentry.captureException(err, {
      level: SentrySeverity.Error,
      trimHeadFrames: 1, // mark this frame as non-app code
    });
  }
  if (config.enableErrorConsoleLogging) {
    // See toplevel comment about behavior of `console` methods.
    console.error(err); // eslint-disable-line
  }
};

/**
 * Log an event at "warning" severity.
 *
 * The event will be logged to Sentry and/or the console as appropriate,
 * including a stack trace.  The stack trace is taken from `event` if an
 * `Error` object, and otherwise from the call site.
 *
 * In the JS debugging console, this produces a yellow-highlighted warning,
 * but no popup interruption.  This makes it appropriate for conditions
 * which have an inevitable background rate.  For conditions which
 * definitely represent a bug in the app, consider `logging.error` instead.
 *
 * See also:
 *  * `logging.error` for logging at higher severity
 */
export const warn = (event: string | Error) => {
  if (config.enableSentry) {
    // See comment in `error` about behavior of `Sentry.captureException`.
    Sentry.captureException(event, {
      level: SentrySeverity.Warning,
      trimHeadFrames: 1,
    });
  }
  if (config.enableErrorConsoleLogging) {
    // See toplevel comment about behavior of `console` methods.
    console.warn(event); // eslint-disable-line
  }
};
