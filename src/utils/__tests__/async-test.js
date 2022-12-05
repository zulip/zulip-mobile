/* @flow strict-local */
import { sleep, BackoffMachine } from '../async';
import { assertUsingFakeTimers } from '../../__tests__/lib/fakeTimers';

describe('BackoffMachine', () => {
  beforeAll(() => {
    assertUsingFakeTimers();
  });

  afterEach(() => {
    expect(jest.getTimerCount()).toBe(0);
    jest.clearAllTimers();
  });

  const measureWait = async (promise: Promise<void>) => {
    const start = Date.now();
    jest.runOnlyPendingTimers();
    await promise;
    return Date.now() - start;
  };

  test('timeouts are random from zero to 100ms, 200ms, 400ms, 800ms...', async () => {
    // This is a randomized test. NUM_TRIALS is chosen so that the failure
    // probability < 1e-9. There are 2 * 11 assertions, and each one has a
    // failure probability < 1e-12; see below.
    const NUM_TRIALS = 100;
    const expectedMaxDurations = [100, 200, 400, 800, 1600, 3200, 6400, 10000, 10000, 10000, 10000];

    const trialResults: Array<$ReadOnlyArray<number>> = [];

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

const sleepMeasure = async (expectedMs: number) => {
  const start = Date.now();
  await sleep(expectedMs);
  const actualMs = Date.now() - start;

  return actualMs;
};

describe('sleep (ideal)', () => {
  beforeAll(() => {
    assertUsingFakeTimers();
  });

  afterEach(() => {
    // clear any unset timers
    expect(jest.getTimerCount()).toBe(0);
    jest.clearAllTimers();
  });

  test('waits for exactly the right number of milliseconds', async () => {
    const expectedMs = 1000;
    const sleepPromise: Promise<number> = sleepMeasure(expectedMs);

    jest.runOnlyPendingTimers();

    // If `sleepPromise` hasn't resolved already, it never will; this await will
    // hang. In this case, Jest will eventually time out and report failure.
    // https://jestjs.io/docs/en/jest-object.html#jestsettimeouttimeout
    const actualMs = await sleepPromise;

    expect(actualMs).toEqual(expectedMs);
  });
});

describe('sleep (real)', () => {
  beforeAll(() => {
    jest.useRealTimers();
  });

  test('waits for approximately the right number of milliseconds', async () => {
    const expectedMs = 1000;
    const actualMs = await sleepMeasure(expectedMs);

    // `sleep` should sleep for the specified number of milliseconds (and not,
    // for example, that many seconds or microseconds).
    expect(actualMs).toBeGreaterThanOrEqual(expectedMs - 1); // [α]
    expect(actualMs).toBeLessThan(10 * expectedMs); // [β]

    // [α] The fudge term of -1 in this test is a workaround for a Node.js
    //     issue, https://github.com/nodejs/node/issues/26578. This has caused
    //     actual test flakes; see our issue #4010 for examples.
    //
    // [β] In theory, we can't be sure of this test; the time between the
    //     specified timeout expiring and a timeslice actually becoming
    //     available may be arbitrarily long.
    //
    //     In practice, 10x really is enough of a padding factor that it's never
    //     been an issue, even with real-world timers on shared CI hardware with
    //     unpredictable loads.
  });
});
