/* @flow strict-local */
import { promiseTimeout, TimeoutError } from '../async';
import { fakeSleep } from '../../__tests__/lib/fakeTimers';

const ONE_MINUTE_MS: number = 1000 * 60;

describe('promiseTimeout', () => {
  afterEach(() => {
    // clear any unset timers
    expect(jest.getTimerCount()).toBe(0);
    jest.clearAllTimers();
  });

  test('If `promise` resolves with `x` before time is up, resolves with `x`', async () => {
    const x = Math.random();
    const quickPromise = fakeSleep(1).then(() => x);

    await expect(promiseTimeout(quickPromise, ONE_MINUTE_MS)).resolves.toBe(x);

    jest.runAllTimers();
  });

  test('If `promise` rejects before time is up, rejects with that reason', async () => {
    const x = Math.random();
    const quickPromise = (async () => {
      await fakeSleep(1);
      throw new Error(x.toString());
    })();

    await expect(promiseTimeout(quickPromise, ONE_MINUTE_MS)).rejects.toThrow(x.toString());

    jest.runAllTimers();
  });

  test('If time is up, throws a TimeoutError', async () => {
    const endlessPromise = new Promise((resolve, reject) => {});

    const endlessPromiseWithTimeout = promiseTimeout(endlessPromise, ONE_MINUTE_MS);
    jest.runAllTimers();

    await expect(endlessPromiseWithTimeout).rejects.toThrow(TimeoutError);
  });
});
