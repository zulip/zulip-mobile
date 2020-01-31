/* @flow strict-local */
import { BackoffMachine } from '../async';
import { Lolex } from '../../__tests__/aux/lolex';

// Since BackoffMachine is in async.js, these tests *should* be in
// async-test.js. But doing that introduces some interference between these
// tests and the other Lolex-based tests, since Jest is running both of them in
// the same environment in parallel. This may be resolved out of the box in Jest
// 26, and it might even be safe in Jest 25.1.0 with a custom environment
// (https://github.com/facebook/jest/pull/8897). But as of 2020-03, putting them
// in a separate file is our workaround.

describe('BackoffMachine', () => {
  const lolex: Lolex = new Lolex();

  afterEach(() => {
    lolex.clearAllTimers();
  });

  afterAll(() => {
    lolex.dispose();
  });

  const measureWait = async (promise: Promise<void>) => {
    const start = Date.now();
    lolex.runOnlyPendingTimers();
    await promise;
    return Date.now() - start;
  };

  test('timeouts are 100ms, 200ms, 400ms, 800ms...', async () => {
    const expectedDurations = [100, 200, 400, 800, 1600, 3200, 6400, 10000, 10000, 10000, 10000];
    const results: number[] = [];

    const backoffMachine = new BackoffMachine();
    for (let j = 0; j < expectedDurations.length; j++) {
      const duration = await measureWait(backoffMachine.wait());
      results.push(duration);
    }
    expectedDurations.forEach((expectedDuration, i) => {
      expect(results[i]).toBe(expectedDuration);
    });
  });
});
