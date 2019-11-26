// @flow strict-local
import Heartbeat from '../heartbeat';

// type alias for Jest callback functions of type (boolean) => void
type CallbackType = JestMockFn<$ReadOnlyArray<boolean>, void>;

describe('Heartbeat', () => {
  // arbitrarily, one full hour between heartbeats
  const HEARTBEAT_TIME = 60 * 60 * 1000;

  // before running tests: set up fake timer API
  beforeAll(() => {
    jest.useFakeTimers();
  });

  // before each test: reset fake-timers state
  beforeEach(() => {
    jest.clearAllTimers();
  });

  // after each test: confirm that all timers have been stopped
  afterEach(() => {
    // $FlowFixMe (Flow picking up wrong libdef file?)
    expect(jest.getTimerCount()).toBe(0);
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
      jest.runOnlyPendingTimers();
      expect(callback).toHaveBeenCalled();
      expect(callback).toHaveBeenLastCalledWith(true);
    }
    callback.mockClear();
  };

  /** Check that the supplied heartbeat is not running. */
  const expectNotRunning = (heartbeat: Heartbeat, callback: CallbackType) => {
    expect(heartbeat.callback).toBe(callback);

    callback.mockClear();
    jest.runOnlyPendingTimers();
    expect(callback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(HEARTBEAT_TIME * 10);
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
    expect(callback).toHaveBeenCalled();
    expect(callback).toHaveBeenLastCalledWith(false);

    expectNotRunning(heartbeat, callback);
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
      jest.advanceTimersByTime(HEARTBEAT_TIME * 1.001);
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
    jest.advanceTimersByTime(HEARTBEAT_TIME * 0.25);
    expect(callback).not.toHaveBeenCalled();
    heartbeat.start();
    expect(callback).not.toHaveBeenCalled(); // sic! deliberate exception

    jest.advanceTimersByTime(HEARTBEAT_TIME * 0.76);
    expect(callback).toHaveBeenCalled();

    heartbeat.stop();
  });
});
