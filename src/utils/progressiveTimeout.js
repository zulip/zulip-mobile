/* @flow strict */
let lastTimeoutTime = 0;
let lastTimeoutLength = -2;

export default (): Promise<void> => {
  if (Date.now() - lastTimeoutTime < 5 * 60 * 1000) {
    lastTimeoutLength = -2;
    lastTimeoutTime = Date.now();
  }

  lastTimeoutLength += lastTimeoutLength < 10 ? 2 : 0;

  return new Promise(resolve => setTimeout(resolve, lastTimeoutLength * 1000));
};
