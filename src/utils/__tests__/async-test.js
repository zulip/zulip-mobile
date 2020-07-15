/* @flow strict-local */
import { sleep } from '../async';

const sleepMeasure = async (expectedMs: number) => {
  const start = Date.now();
  await sleep(expectedMs);
  const actualMs = Date.now() - start;

  return actualMs;
};

describe('sleep (ideal)', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern');
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
