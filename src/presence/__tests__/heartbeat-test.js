// @flow strict-local
import LolexModule from 'lolex';
import Heartbeat from '../heartbeat';

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
 */
class Lolex {
  /* eslint-disable no-underscore-dangle */

  /** The installed Lolex clock object. (Name also taken from Jest's
      implementation, for simplicity's sake. */
  _clock;
  constructor() {
    this._clock = LolexModule.install();
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

  dispose(): void {
    this._clock.uninstall();
  }
}

let lolex: Lolex;

// type alias for Jest callback functions of type (boolean) => void
type CallbackType = JestMockFn<$ReadOnlyArray<boolean>, void>;

describe('Heartbeat', () => {
  // arbitrarily, one full hour between heartbeats
  const HEARTBEAT_TIME = 60 * 60 * 1000;

  // before running tests: set up fake timer API
  beforeAll(() => {
    // jest.useFakeTimers();
    lolex = new Lolex();
  });

  afterAll(() => {
    // jest.useRealTimers();
    lolex.dispose();
  });

  // before each test: reset fake-timers state
  beforeEach(() => {
    lolex.clearAllTimers();
  });

  // after each test: confirm that all timers have been stopped
  afterEach(() => {
    expect(lolex.getTimerCount()).toBe(0);
  });

  // convenience function: create a new Heartbeat with its associated callback
  const setup = (): {|
    callback: CallbackType,
    heartbeat: Heartbeat,
  |} => {
    const callback: CallbackType = jest.fn();
    const heartbeat = new Heartbeat(callback, HEARTBEAT_TIME);
    return { callback, heartbeat };
  };

  // Heartbeat erases its callback type (and it should probably be private
  // anyway), so the `expectRunning` and `expectNotRunning` helpers take the
  // callback mock as a separate well-typed argument.

  /**
   * Check that the supplied heartbeat is running, and confirm that it continues
   * to run for at least `count` cycles.
   */
  const expectRunning = (heartbeat: Heartbeat, callback: CallbackType, count: number = 10) => {
    expect(heartbeat.callback).toBe(callback);
    for (let i = 0; i < count; ++i) {
      callback.mockClear();
      lolex.runOnlyPendingTimers();
      expect(callback).toHaveBeenCalled();
      expect(callback).toHaveBeenLastCalledWith(true);
    }
    callback.mockClear();
  };

  /** Check that the supplied heartbeat is not running. */
  const expectNotRunning = (heartbeat: Heartbeat, callback: CallbackType) => {
    expect(heartbeat.callback).toBe(callback);

    callback.mockClear();

    lolex.runOnlyPendingTimers();
    expect(callback).not.toHaveBeenCalled();

    lolex.advanceTimersByTime(HEARTBEAT_TIME * 10);
    expect(callback).not.toHaveBeenCalled();
  };

  test('starts inactive', () => {
    const { heartbeat, callback } = setup();

    expect(heartbeat.isActive()).toBeFalse();
    expect(callback).not.toHaveBeenCalled();

    expectNotRunning(heartbeat, callback);
  });

  test('can be turned on and off', () => {
    const { heartbeat, callback } = setup();

    expect(callback).not.toHaveBeenCalled();
    heartbeat.start();
    expect(callback).toHaveBeenCalled();
    expect(callback).toHaveBeenLastCalledWith(true);

    expectRunning(heartbeat, callback);

    heartbeat.stop();
    expect(callback).not.toHaveBeenCalled();

    expectNotRunning(heartbeat, callback);
  });

  test('can be turned on and off repeatedly without signal', () => {
    const { heartbeat, callback } = setup();

    heartbeat.start();

    for (let i = 0; i < 10; ++i) {
      callback.mockClear();
      heartbeat.stop();
      expect(callback).not.toHaveBeenCalled();

      callback.mockClear();
      heartbeat.start();
      expect(callback).not.toHaveBeenCalled();
    }

    heartbeat.stop();
  });

  test('can be turned on and off repeatedly _with_ signal', () => {
    const { heartbeat, callback } = setup();

    heartbeat.start();

    for (let i = 0; i < 10; ++i) {
      callback.mockClear();
      heartbeat.stop();
      expect(callback).not.toHaveBeenCalled();

      // delay past HEARTBEAT_TIME
      callback.mockClear();
      lolex.advanceTimersByTime(HEARTBEAT_TIME * 1.1);
      expect(callback).not.toHaveBeenCalled();

      callback.mockClear();
      heartbeat.start();
      expect(callback).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenLastCalledWith(true);
    }

    heartbeat.stop();
  });

  test('takes about the right amount of time', () => {
    const { heartbeat, callback } = setup();

    expect(callback).not.toHaveBeenCalled();
    heartbeat.start();
    expect(callback).toHaveBeenCalled();
    callback.mockClear();

    for (let i = 0; i < 10; ++i) {
      lolex.advanceTimersByTime(HEARTBEAT_TIME * 1.001);
      expect(callback).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenLastCalledWith(true);
      callback.mockClear();
    }

    heartbeat.stop();
    expect(callback).not.toHaveBeenCalled();
  });

  test('has idempotent stop()', () => {
    const { heartbeat, callback } = setup();

    expect(callback).not.toHaveBeenCalled();

    heartbeat.stop();
    expect(callback).not.toHaveBeenCalled();
    expectNotRunning(heartbeat, callback);

    heartbeat.stop();
    expect(callback).not.toHaveBeenCalled();
    expectNotRunning(heartbeat, callback);
  });

  test('has idempotent start()', () => {
    const { heartbeat, callback } = setup();

    expect(callback).not.toHaveBeenCalled();
    heartbeat.start();
    expect(callback).toHaveBeenCalled();

    expectRunning(heartbeat, callback, 3);
    lolex.advanceTimersByTime(HEARTBEAT_TIME * 0.25);
    expect(callback).not.toHaveBeenCalled();
    heartbeat.start();
    expect(callback).not.toHaveBeenCalled(); // sic!

    lolex.advanceTimersByTime(HEARTBEAT_TIME * 0.76);
    expect(callback).toHaveBeenCalled();

    heartbeat.stop();
  });
});
