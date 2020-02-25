/* @flow strict-local */
import { sleep, tryUntilSuccessful } from '../async';

describe('sleep', () => {
  test('waits for a given time in milliseconds', async () => {
    const expectedMs = 1000;

    const start = Date.now();
    await sleep(expectedMs);
    const actualMs = Date.now() - start;

    // `sleep` should sleep for the specified number of milliseconds (and not,
    // for example, that many seconds or microseconds).
    expect(expectedMs).toBeLessThanOrEqual(actualMs);
    expect(actualMs).toBeLessThan(10 * expectedMs); // [α]

    // [α] In theory, we can't be sure of this test; the time between the
    // specified timeout expiring and a timeslice actually becoming available
    // may be arbitrarily long.
    //
    // In practice, 10x really is enough of a padding factor that it's never
    // been an issue, even with real-world timers on shared CI hardware with
    // unpredictable loads.
  });
});

describe('tryUntilSuccessful', () => {
  test('resolves any value when there is no exception', async () => {
    const result = await tryUntilSuccessful(async () => 'hello');

    expect(result).toEqual('hello');
  });

  test('resolves any promise, if there is no exception', async () => {
    const result = await tryUntilSuccessful(
      () => new Promise(resolve => setTimeout(() => resolve('hello'), 100)),
    );

    expect(result).toEqual('hello');
  });

  test('retries a call, if there is an exception', async () => {
    // fail on first call, succeed second time
    let callCount = 0;
    const thrower = () => {
      callCount++;
      if (callCount === 1) {
        throw new Error('First run exception');
      }
      return 'hello';
    };

    const result = await tryUntilSuccessful(async () => thrower());

    expect(result).toEqual('hello');
  });
});
