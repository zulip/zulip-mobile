/* @flow strict */
import { sleep, tryUntilSuccessful } from '../async';

describe('sleep', () => {
  test('waits for a given time in milliseconds', async () => {
    const expectedMs = 1000;
    const start = Date.now();
    await sleep(expectedMs);
    const durationMs = Date.now() - start;
    expect(expectedMs <= durationMs && durationMs < 10 * expectedMs).toBeTruthy();
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
