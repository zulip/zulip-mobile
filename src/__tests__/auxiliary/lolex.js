// @flow strict-local

import LolexModule from 'lolex';

/*
 * At present (Jest v24.9.0), Jest does not override Date.now() when using a
 * fake timer implementation. This means that any timer-based code relying on
 * Date.now() for throttling (etc.) will be very confused.
 *
 * The good news is that Jest is very close to using Lolex internally -- see,
 * e.g., https://github.com/facebook/jest/pull/7776 -- at which point that
 * behavior will be available to us via Jest. The bad news, alas, is that it's
 * not there yet.
 *
 * For now, we borrow slices of Jest's planned Lolex-based timer implementation.
 */

/**
 * A Lolex-backed implementation of certain relevant Jest functions.
 *
 * Carved from the more-complete, not-yet-NPM-available implementation at:
 * https://github.com/facebook/jest/blob/9279a3a97/packages/jest-fake-timers/src/FakeTimersLolex.ts
 *
 * Instantiating one of these will switch Jest over to using Lolex's
 * `Date.now()` replacement. Calling `.dispose()` on that instantiation will
 * remove that. (Behavior in the presence of multiple Lolex instances is not
 * defined. Don't do that.)
 *
 * Users of this class are recommended to use Jest's setup and teardown
 * functions, perhaps as follows:
 *
 * ```
 * describe('description', () => {
 *   const lolex: Lolex = new Lolex();
 *
 *   afterEach(() => { lolex.clearAllTimers(); });
 *   afterAll(() => { lolex.dispose(); });
 *
 *   // ...tests...
 * });
 * ```
 */
export class Lolex {
  /** The installed Lolex clock object. (Name also taken from Jest's
      implementation, for simplicity's sake. */
  _clock;

  constructor() {
    this._clock = LolexModule.install();

    // Wrap Lolex's setTimeout and setInterval with additional checks.
    //
    // In Node.js, where Jest runs, a timeout or interval of greater than
    // INT32_MAX is reduced to exactly 1. (In browsers, and probably in React
    // Native, it is instead truncated to an int32 value.)
    //
    // This can lead to subtle bugs. Rather than risk this, cause any test which
    // would hit this check to fail immediately.
    const maxTimer = 2 ** 31 - 1;
    const wrapTimerFunction = fn => {
      const wrapped = (_cb, delay: number, ...rest) => {
        // do not refactor this conditional without considering NaN
        if (!(delay <= maxTimer)) {
          throw new Error(`timer too large (${delay}; max ${maxTimer})`);
        }
        // eslint-disable-next-line prefer-rest-params
        return fn.apply(this, [_cb, delay, ...rest]);
      };
      return wrapped;
    };

    const clock = this._clock;
    clock.setTimeout = wrapTimerFunction(clock.setTimeout);
    clock.setInterval = wrapTimerFunction(clock.setInterval);
  }

  clearAllTimers(): void {
    this._clock.reset();
  }

  getTimerCount(): number {
    return this._clock.countTimers();
  }

  runOnlyPendingTimers(): void {
    this._clock.runToLast();
  }

  advanceTimersByTime(msToRun: number): void {
    this._clock.tick(msToRun);
  }

  setSystemTime(now?: number): void {
    this._clock.setSystemTime(now);
  }

  dispose(): void {
    this._clock.uninstall();
  }

  /**
   * Convenience function; not part of jest-lolex interface.
   *
   * Per Lolex's implementation, adjusts both the clock and the relative
   * timestamps of all timers. This can be used to simulate an environment in
   * which timers are entirely stopped while their hosting process is inactive.
   */
  unsafeAdvanceOnlyTime(ms: number) {
    this.setSystemTime(Date.now() + ms);
  }
}
