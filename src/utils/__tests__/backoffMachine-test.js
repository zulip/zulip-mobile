/* @flow strict-local */
import { BackoffMachine } from '../async';
import { Lolex } from '../../__tests__/lib/lolex';

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

  test('timeouts are random from zero to 100ms, 200ms, 400ms, 800ms...', async () => {
    // This is a randomized test. NUM_TRIALS is chosen so that the failure
    // probability < 1e-9. There are 2 * 11 assertions, and each one has a
    // failure probability < 1e-12; see below.
    const NUM_TRIALS = 100;
    const expectedMaxDurations = [100, 200, 400, 800, 1600, 3200, 6400, 10000, 10000, 10000, 10000];

    const trialResults: Array<number[]> = [];

    for (let i = 0; i < NUM_TRIALS; i++) {
      const resultsForThisTrial = [];
      const backoffMachine = new BackoffMachine();
      for (let j = 0; j < expectedMaxDurations.length; j++) {
        const duration = await measureWait(backoffMachine.wait());
        resultsForThisTrial.push(duration);
      }
      trialResults.push(resultsForThisTrial);
    }

    expectedMaxDurations.forEach((expectedMax, i) => {
      const maxFromAllTrials = Math.max(...trialResults.map(r => r[i]));
      const minFromAllTrials = Math.min(...trialResults.map(r => r[i]));

      // Each of these assertions has a failure probability of:
      //     0.75 ** NUM_TRIALS = 0.75 ** 100 < 1e-12
      expect(minFromAllTrials).toBeLessThan(expectedMax * 0.25);
      expect(maxFromAllTrials).toBeGreaterThan(expectedMax * 0.75);
    });
  });
});
