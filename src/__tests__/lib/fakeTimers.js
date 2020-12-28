/* @flow strict-local */
import { sleep } from '../../utils/async';

/**
 * Return a promise to sleep `ms` after advancing fake timers by `ms`.
 */
export const fakeSleep = async (ms: number): Promise<void> => {
  // Only available if using the "modern" implementation
  if (typeof jest.getRealSystemTime !== 'function') {
    throw new Error("Tried to call `fakeSleep` without `jest.useFakeTimers('modern')` in effect.");
  }
  const sleepPromise = sleep(ms);
  jest.advanceTimersByTime(ms);
  return sleepPromise;
};
