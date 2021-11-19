/* @flow strict-local */
import { ExtendableError } from './logging';

export class TimeoutError extends ExtendableError {}

/**
 * Time-out a Promise after `timeLimitMs` has passed.
 *
 * Returns a new Promise that rejects with a TimeoutError if the
 * passed `promise` doesn't settle (resolve/reject) within the time
 * limit specified by `timeLimitMs`; otherwise, it settles the way
 * `promise` does.
 */
export async function promiseTimeout<T>(promise: Promise<T>, timeLimitMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new TimeoutError()), timeLimitMs)),
  ]);
}

/** Like setTimeout(..., 0), but returns a Promise of the result. */
export function delay<T>(callback: () => T): Promise<T> {
  return new Promise(resolve => resolve()).then(callback);
}

export const sleep = (ms: number = 0): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Makes a machine that can sleep for increasing durations, for network backoff.
 *
 * Call the constructor before a loop starts, and call .wait() in each iteration
 * of the loop. Do not re-use the instance after exiting the loop.
 */
export class BackoffMachine {
  _firstDuration: number;
  _durationCeiling: number;
  _base: number;

  _startTime: number | void;
  _waitsCompleted: number;

  constructor() {
    this._firstDuration = 100;
    this._durationCeiling = 10 * 1000;
    this._base = 2;

    this._startTime = undefined;
    this._waitsCompleted = 0;
  }

  /**
   * How many waits have completed so far.
   *
   * Use this to implement "give up" logic by breaking out of the loop after a
   * threshold number of waits.
   */
  waitsCompleted(): number {
    return this._waitsCompleted;
  }

  /**
   * Promise to resolve after the appropriate duration.
   *
   * The popular exponential backoff strategy is to increase the duration
   * exponentially with the number of sleeps completed, with a base of 2, until  a
   * ceiling is reached. E.g., if firstDuration is 100 and durationCeiling is 10 *
   * 1000 = 10000, the sequence is
   *
   * 100, 200, 400, 800, 1600, 3200, 6400, 10000, 10000, 10000, ...
   *
   * Instead of using this strategy directly, we also apply "jitter". We use
   * capped exponential backoff for the *upper bound* on a random duration, where
   * the lower bound is always zero. Mitigating "bursts" is the goal of any
   * "jitter" strategy, and the larger the range of randomness, the smoother the
   * bursts. Keeping the lower bound at zero maximizes the range while preserving
   * a capped exponential shape on the expected value. Greg discusses this in more
   * detail in #3841.
   */
  async wait(): Promise<void> {
    if (this._startTime === undefined) {
      this._startTime = Date.now();
    }

    const duration =
      Math.random() // "Jitter"
      * Math.min(
        // Upper bound of random duration should not exceed durationCeiling
        this._durationCeiling,
        this._firstDuration * this._base ** this._waitsCompleted,
      );

    await sleep(duration);

    this._waitsCompleted++;
  }
}
