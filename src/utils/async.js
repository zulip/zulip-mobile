/* @flow */

/** Like setTimeout(..., 0), but returns a Promise of the result. */
export function delay<T>(callback: () => T): Promise<T> {
  return new Promise(resolve => resolve()).then(callback);
}

export const sleep = (ms: number = 0): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

export const tryUntilSuccessful = async (
  func: any,
  maxRetries: number = 1000,
  timeoutMs: number = 1000,
) => {
  if (!maxRetries) {
    return func();
  }

  try {
    return await func();
  } catch (e) {
    await new Promise(resolve => setTimeout(resolve, timeoutMs));
  }
  return tryUntilSuccessful(func, maxRetries - 1, timeoutMs * 1.5);
};
