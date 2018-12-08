/* @flow strict */

/** The time at which we last started a timeout. */
let lastTimeoutTime = 0;

/** The duration of the last timeout we started. */
let lastDuration = 0;

const resetPeriod = 60 * 1000;
const maxDuration = 10 * 1000;
const incrementDuration = 100;
const exponent = 2;

const chooseNextDuration = () => {
  if (Date.now() > lastTimeoutTime + resetPeriod) {
    return 0;
  }
  // prettier-ignore
  return Math.min(maxDuration,
     Math.max(incrementDuration,
      exponent * lastDuration));
};

/**
 * Sleep for a timeout that progressively grows in duration.
 *
 * Starts at 0 on the first call.  Grows initially by a small increment,
 * then exponentially, up to a maximum.
 *
 * If the last call was over 60s ago, starts over at 0.
 */
export default (): Promise<void> => {
  lastDuration = chooseNextDuration();
  lastTimeoutTime = Date.now();
  return new Promise(resolve => setTimeout(resolve, lastDuration));
};
