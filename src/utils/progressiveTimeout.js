/* @flow strict */
let lastTimeoutTime = 0;
let timeoutLength = 0;

/**
 * Timeout that progressively increases its duration
 * Starts at 0 (no timeout the first time) and increases by 250 milliseconds
 * until it reaches 5 secs.
 * If the last timeout was more than a minute ago reset duration.
 */
export default (): Promise<void> => {
  if (Date.now() - lastTimeoutTime > 60 * 1000) {
    // did the last timeout happen more than a minute ago?
    timeoutLength = 0;
  } else if (timeoutLength < 5000) {
    // increase timeout by 250 milliseconds (only if not already at 5 secs)
    timeoutLength += 250;
  }
  lastTimeoutTime = Date.now();
  return new Promise(resolve => setTimeout(resolve, timeoutLength));
};
