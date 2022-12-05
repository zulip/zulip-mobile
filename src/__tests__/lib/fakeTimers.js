/* @flow strict-local */
import { sleep } from '../../utils/async';

/**
 * Ensure the fake-timer implementation is used.
 *
 * By setting `timers: 'fake'` in our Jest config, the fake-timer
 * implementation is the default. May be used to double-check that
 * this default is in fact set, in our Jest setup file.
 *
 * Also, in one or two files, we switch over to using real timers,
 * with `jest.useRealTimers()`. May be used in those files to make
 * sure this setting doesn't linger where we don't want it to.
 *
 * Note: As of Jest 27, there are "modern" and "legacy" fake-timer
 * implementations. This checks for the "modern" one, which is the only one
 * we should use.
 */
export const assertUsingFakeTimers = () => {
  // "Note: This function is only available when using modern fake
  // timers implementation"
  //
  // -- https://jestjs.io/docs/en/jest-object#jestgetrealsystemtime
  jest.getRealSystemTime();
};

/**
 * Return a promise to sleep `ms` after advancing fake timers by `ms`.
 */
export const fakeSleep = async (ms: number): Promise<void> => {
  try {
    assertUsingFakeTimers();
  } catch {
    throw new Error('Tried to call `fakeSleep` without fake-timer implementation enabled.');
  }

  const sleepPromise = sleep(ms);
  jest.advanceTimersByTime(ms);
  return sleepPromise;
};
