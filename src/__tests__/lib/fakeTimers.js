/* @flow strict-local */
import { sleep } from '../../utils/async';

/**
 * Ensure the "modern" fake-timer implementation is used.
 *
 * By setting `timers: 'modern'` in our Jest config, the modern
 * implementation is the default. May be used to double-check that
 * this default is in fact set, in our Jest setup file.
 *
 * Also, in one or two files, we switch over to using real timers,
 * with `jest.useRealTimers()`. May be used in those files to make
 * sure this setting doesn't linger where we don't want it to.
 */
export const assertUsingModernFakeTimers = () => {
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
    assertUsingModernFakeTimers();
  } catch (e) {
    throw new Error(
      'Tried to call `fakeSleep` without "modern" fake-timer implementation enabled.',
    );
  }

  const sleepPromise = sleep(ms);
  jest.advanceTimersByTime(ms);
  return sleepPromise;
};
