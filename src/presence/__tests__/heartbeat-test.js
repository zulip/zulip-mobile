// @flow strict-local
import Heartbeat from '../heartbeat';

// (hopefully) restrictive type alias for Jest's mock callback functions
type CallbackType = JestMockFn<$ReadOnlyArray<void>, void>;

describe('Heartbeat', () => {
  // ===================================================================
  // Constants and conveniences

  // arbitrarily, one full hour between heartbeats
  const HEARTBEAT_TIME = 60 * 60 * 1000;

  /**
   * Wrapper class for Heartbeat.
   *
   * Since Heartbeat erases its callback type (and `callback` should be private
   * anyway!), it's inconvenient to access the Jest mock functionality of
   * Heartbeat's callback. This wrapper provides fully-typed access to the
   * callback.
   *
   * As a convenience, we also keep track of the current set of Heartbeats used
   * by test cases.
   */
  class JestHeartbeatHelper {
    callback: CallbackType;
    heartbeat: Heartbeat;

    // eslint-disable-next-line no-use-before-define
    static _currentHeartbeats: Array<JestHeartbeatHelper> = [];

    constructor() {
      this.callback = jest.fn();
      this.heartbeat = new Heartbeat(this.callback, HEARTBEAT_TIME);
      // eslint-disable-next-line no-underscore-dangle
      JestHeartbeatHelper._currentHeartbeats.push(this);
    }

    start() {
      this.heartbeat.start();
    }
    stop() {
      this.heartbeat.stop();
    }
    isActive(): boolean {
      return this.heartbeat.isActive();
    }

    static getExtant(): $ReadOnlyArray<JestHeartbeatHelper> {
      return this._currentHeartbeats;
    }
    static clearExtant() {
      this._currentHeartbeats = [];
    }
  }

  // convenience function: create a new Heartbeat with its associated callback
  const setup = (): {|
    callback: CallbackType,
    heartbeat: JestHeartbeatHelper,
  |} => {
    const heartbeat = new JestHeartbeatHelper();
    const { callback } = heartbeat;
    return { heartbeat, callback };
  };

  /**
   * Check that the supplied heartbeat is running, and confirm that it continues
   * to run for at least `count` cycles.
   */
  const expectRunning = (heartbeat: JestHeartbeatHelper, count: number = 10) => {
    const { callback } = heartbeat;
    for (let i = 0; i < count; ++i) {
      callback.mockClear();
      jest.runOnlyPendingTimers();
      expect(callback).toHaveBeenCalled();
    }
    callback.mockClear();
  };

  /** Check that the supplied heartbeat is not running. */
  const expectNotRunning = (heartbeat: JestHeartbeatHelper) => {
    const { callback } = heartbeat;

    callback.mockClear();

    jest.runOnlyPendingTimers();
    expect(callback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(HEARTBEAT_TIME * 10);
    expect(callback).not.toHaveBeenCalled();
  };

  // ===================================================================
  // Jest hooks

  afterAll(() => {
    JestHeartbeatHelper.clearExtant();
  });

  // before each test: reset common state
  beforeEach(() => {
    jest.clearAllTimers();
    JestHeartbeatHelper.clearExtant();
  });

  // after each test: confirm common properties
  afterEach(() => {
    const heartbeats = JestHeartbeatHelper.getExtant();

    for (const heartbeat of heartbeats) {
      // Tests should stop all their Heartbeats.
      expect(heartbeat.isActive()).toBeFalse();
      heartbeat.callback.mockClear();
    }

    // Stopped heartbeats may have timers running, but those timers should not
    // persist beyond their next firing...
    jest.runOnlyPendingTimers();
    expect(jest.getTimerCount()).toBe(0);

    // ... and none of those _timer_ firings should result in a _callback_
    // firing.
    for (const heartbeat of heartbeats) {
      expect(heartbeat.callback).not.toHaveBeenCalled();
    }
  });

  // ===================================================================
  // Test cases

  test('starts inactive', () => {
    const { heartbeat, callback } = setup();

    expect(heartbeat.isActive()).toBeFalse();
    expect(callback).not.toHaveBeenCalled();

    expectNotRunning(heartbeat);
  });

  test('can be turned on and off', () => {
    const { heartbeat, callback } = setup();

    expect(callback).not.toHaveBeenCalled();
    heartbeat.start();
    expect(callback).toHaveBeenCalled();

    expectRunning(heartbeat);

    heartbeat.stop();
    expect(callback).not.toHaveBeenCalled();

    expectNotRunning(heartbeat);
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
      jest.advanceTimersByTime(HEARTBEAT_TIME * 1.1);
      expect(callback).not.toHaveBeenCalled();

      callback.mockClear();
      heartbeat.start();
      expect(callback).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledTimes(1);
    }

    heartbeat.stop();
  });

  test('can be turned off and on without delaying the signal', () => {
    const { heartbeat, callback } = setup();

    heartbeat.start();
    callback.mockClear();

    // Late in interval, stop and start again.
    jest.advanceTimersByTime(HEARTBEAT_TIME * 0.8);
    heartbeat.stop();
    jest.advanceTimersByTime(HEARTBEAT_TIME * 0.1);
    heartbeat.start();

    // No signal yet...
    expect(callback).not.toHaveBeenCalled();
    // ... but signal promptly at end of original interval.
    jest.advanceTimersByTime(HEARTBEAT_TIME * 0.101);
    expect(callback).toHaveBeenCalled();

    heartbeat.stop();
  });

  test('takes about the right amount of time', () => {
    const { heartbeat, callback } = setup();

    expect(callback).not.toHaveBeenCalled();
    heartbeat.start();
    expect(callback).toHaveBeenCalled();
    callback.mockClear();

    for (let i = 0; i < 10; ++i) {
      jest.advanceTimersByTime(HEARTBEAT_TIME * 1.001);
      expect(callback).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledTimes(1);
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
    expectNotRunning(heartbeat);

    heartbeat.stop();
    expect(callback).not.toHaveBeenCalled();
    expectNotRunning(heartbeat);
  });

  test('has idempotent start()', () => {
    const { heartbeat, callback } = setup();

    expect(callback).not.toHaveBeenCalled();
    heartbeat.start();
    expect(callback).toHaveBeenCalled();

    expectRunning(heartbeat, 3);
    jest.advanceTimersByTime(HEARTBEAT_TIME * 0.25);
    expect(callback).not.toHaveBeenCalled();
    heartbeat.start();
    expect(callback).not.toHaveBeenCalled(); // sic!

    jest.advanceTimersByTime(HEARTBEAT_TIME * 0.76);
    expect(callback).toHaveBeenCalled();

    heartbeat.stop();
  });
});
