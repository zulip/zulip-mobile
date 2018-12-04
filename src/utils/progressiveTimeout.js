/* @flow strict */

/** The time at which we last started a timeout. */
let lastTimeoutTime = 0;

/** The duration of the last timeout we started. */
let timeoutLength = 0;

/**
 * Sleep for a timeout that progressively grows in duration.
 *
 * Starts at 0 on the first call, and increases by 250ms each call, to a
 * maximum of 5s.
 *
 * If the last call was over 60s ago, starts over at 0.
 */
export default (): Promise<void> => {
  if (Date.now() > lastTimeoutTime + 60 * 1000) {
    timeoutLength = 0;
  } else {
    timeoutLength = Math.min(5000, timeoutLength + 250);
  }
  lastTimeoutTime = Date.now();
  return new Promise(resolve => setTimeout(resolve, timeoutLength));
};
