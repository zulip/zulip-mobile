/* @flow strict-local */
import { sleep, tryUntilSuccessful } from '../async';
import { Lolex } from '../../__tests__/lib/lolex';

const sleepMeasure = async (expectedMs: number) => {
  const start = Date.now();
  await sleep(expectedMs);
  const actualMs = Date.now() - start;

  return actualMs;
};

describe('sleep (ideal)', () => {
  const lolex: Lolex = new Lolex();

  afterAll(() => {
    lolex.dispose();
  });

  afterEach(() => {
    // clear any unset timers
    lolex.clearAllTimers();
  });

  test('waits for exactly the right number of milliseconds', async () => {
    const expectedMs = 1000;
    const sleepPromise: Promise<number> = sleepMeasure(expectedMs);

    lolex.runOnlyPendingTimers();

    // If `sleepPromise` hasn't resolved already, it never will; this await will
    // hang. In this case, Jest will eventually time out and report failure.
    // https://jestjs.io/docs/en/jest-object.html#jestsettimeouttimeout
    const actualMs = await sleepPromise;

    expect(actualMs).toEqual(expectedMs);
  });
});

describe('sleep (real)', () => {
  test('waits for approximately the right number of milliseconds', async () => {
    const expectedMs = 1000;
    const actualMs = await sleepMeasure(expectedMs);

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
