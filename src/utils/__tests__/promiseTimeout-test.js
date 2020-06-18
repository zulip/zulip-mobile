/* @flow strict-local */
import { promiseTimeout, TimeoutError, sleep } from '../async';
import { Lolex } from '../../__tests__/lib/lolex';

const ONE_MINUTE_MS: number = 1000 * 60 * 60;

describe('promiseTimeout', () => {
  const lolex: Lolex = new Lolex();

  afterAll(() => {
    lolex.dispose();
  });

  afterEach(() => {
    // clear any unset timers
    lolex.clearAllTimers();
  });

  test('If `promise` resolves with `x` before time is up, resolves with `x`, `onTimeout` not called', async () => {
    const x = Math.random();
    const quickPromise = new Promise(resolve => setTimeout(() => resolve(x), 1));

    const onTimeout = jest.fn();

    const quickPromiseWithTimeout = promiseTimeout(quickPromise, ONE_MINUTE_MS, onTimeout);
    lolex.runOnlyPendingTimers();

    const resolution = await quickPromiseWithTimeout;

    expect(resolution).toEqual(x);
    expect(onTimeout).not.toHaveBeenCalled();
  });

  test('If `promise` rejects before time is up, rejects with that reason, `onTimeout` not called', async () => {
    const x = Math.random();
    const quickPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error(x.toString())), 1),
    );

    const onTimeout = jest.fn();

    const quickPromiseWithTimeout = promiseTimeout(quickPromise, ONE_MINUTE_MS, onTimeout);
    lolex.runOnlyPendingTimers();

    await expect(quickPromiseWithTimeout).rejects.toThrow(x.toString());
    expect(onTimeout).not.toHaveBeenCalled();
  });

  describe('If time is up', () => {
    test('Throws a TimeoutError if `onTimeout` not passed', async () => {
      const endlessPromise = new Promise((resolve, reject) => {});

      const endlessPromiseWithTimeout = promiseTimeout(endlessPromise, ONE_MINUTE_MS);
      lolex.runOnlyPendingTimers();

      await expect(endlessPromiseWithTimeout).rejects.toThrow(TimeoutError);
    });

    test('If `onTimeout` passed, calls it once, with no arguments', async () => {
      const endlessPromise = new Promise((resolve, reject) => {});

      const onTimeout = jest.fn();

      const endlessPromiseWithTimeout = promiseTimeout(endlessPromise, ONE_MINUTE_MS, onTimeout);
      lolex.runOnlyPendingTimers();

      await endlessPromiseWithTimeout;

      expect(onTimeout).toHaveBeenCalledTimes(1);
      expect(onTimeout).toHaveBeenCalledWith();
    });

    test('If `onTimeout` returns a non-Promise `x`, resolves to `x` immediately', async () => {
      const endlessPromise = new Promise((resolve, reject) => {});

      const x = Math.random();
      const onTimeout = () => x;

      const endlessPromiseWithTimeout = promiseTimeout(endlessPromise, ONE_MINUTE_MS, onTimeout);
      lolex.runOnlyPendingTimers();

      const result = await endlessPromiseWithTimeout;

      expect(result).toEqual(x);
    });

    test('If `onTimeout` returns a Promise that resolves to `x`, resolves to `x`', async () => {
      const endlessPromise = new Promise((resolve, reject) => {});

      const x = Math.random();
      const onTimeout = async () => {
        await sleep(ONE_MINUTE_MS);
        return x;
      };

      const endlessPromiseWithTimeout = promiseTimeout(endlessPromise, ONE_MINUTE_MS, onTimeout);
      await lolex.runAllTimersAsync();

      const result = await endlessPromiseWithTimeout;

      expect(result).toEqual(x);
    });

    test('If `onTimeout` returns a Promise that rejects, rejects with that reason', async () => {
      const endlessPromise = new Promise((resolve, reject) => {});

      const x = Math.random();
      const onTimeout = async () => {
        await sleep(ONE_MINUTE_MS);
        throw new Error(x.toString());
      };

      const endlessPromiseWithTimeout = promiseTimeout(endlessPromise, ONE_MINUTE_MS, onTimeout);
      await lolex.runAllTimersAsync();

      await expect(endlessPromiseWithTimeout).rejects.toThrow(x.toString());
    });

    test('If `onTimeout` returns a Promise, that promise does not give `promise` extra time', async () => {
      const ONE_SECOND: number = 1000;
      const TWO_SECONDS: number = 2000;

      const promise = (async () => {
        await sleep(TWO_SECONDS);
        throw new Error(`Should have timed out after ${ONE_SECOND}ms.`);
      })();

      const onTimeout = async (): Promise<true> => {
        await sleep(TWO_SECONDS);
        return true;
      };

      const promiseWithTimeout = promiseTimeout(promise, ONE_SECOND, onTimeout);
      await lolex.runAllTimersAsync();

      const result = await promiseWithTimeout;

      expect(result).toEqual(true);
    });
  });
});
