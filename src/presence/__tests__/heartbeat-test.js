// @flow strict-local
import { Lolex } from '../../__tests__/auxiliary/lolex';
import Heartbeat from '../heartbeat';

/** Fake clock implementation. See 'auxiliary/lolex' for more details. */
let lolex: Lolex;

// (hopefully) restrictive type alias for Jest's mock callback functions
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

  /**
   * Wrapper class for Heartbeat.
   *
   * Since Heartbeat erases its callback type (and `callback` should be private
   * anyway!), it's inconvenient to access the Jest mock functionality of
   * Heartbeat's callback. This wrapper provides fully-typed access to the
   * callback.
   *
   * (In future revisions it will also log Heartbeat state toggles, to assist in
   * asserting that certain operational predicates are valid.)
   */
  class JestHeartbeatHelper {
    callback: CallbackType;
    heartbeat: Heartbeat;

    constructor() {
      this.callback = jest.fn();
      this.heartbeat = new Heartbeat(this.callback, HEARTBEAT_TIME);
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
      lolex.runOnlyPendingTimers();
      expect(callback).toHaveBeenCalled();
      expect(callback).toHaveBeenLastCalledWith(true);
    }
    callback.mockClear();
  };

  /** Check that the supplied heartbeat is not running. */
  const expectNotRunning = (heartbeat: JestHeartbeatHelper) => {
    const { callback } = heartbeat;

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

    expectNotRunning(heartbeat);
  });

  test('can be turned on and off', () => {
    const { heartbeat, callback } = setup();

    expect(callback).not.toHaveBeenCalled();
    heartbeat.start();
    expect(callback).toHaveBeenCalled();
    expect(callback).toHaveBeenLastCalledWith(true);

    expectRunning(heartbeat);

    heartbeat.stop();
    expect(callback).toHaveBeenCalled();
    expect(callback).toHaveBeenLastCalledWith(false);

    expectNotRunning(heartbeat);
  });

  test('can be turned on and off repeatedly', () => {
    const { heartbeat, callback } = setup();

    expect(callback).not.toHaveBeenCalled();

    for (let i = 0; i < 10; ++i) {
      callback.mockClear();
      heartbeat.start();
      expect(callback).toHaveBeenCalled();
      expect(callback).toHaveBeenLastCalledWith(true);

      callback.mockClear();
      heartbeat.stop();
      expect(callback).toHaveBeenCalled();
      expect(callback).toHaveBeenLastCalledWith(false);
    }
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
    lolex.advanceTimersByTime(HEARTBEAT_TIME * 0.25);
    expect(callback).not.toHaveBeenCalled();
    heartbeat.start();
    expect(callback).not.toHaveBeenCalled(); // sic! deliberate exception

    lolex.advanceTimersByTime(HEARTBEAT_TIME * 0.76);
    expect(callback).toHaveBeenCalled();

    heartbeat.stop();
  });
});
