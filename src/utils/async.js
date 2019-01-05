/* @flow strict */
import progressiveTimeout from './progressiveTimeout';

/** Like setTimeout(..., 0), but returns a Promise of the result. */
export function delay<T>(callback: () => T): Promise<T> {
  return new Promise(resolve => resolve()).then(callback);
}

export const sleep = (ms: number = 0): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

export async function tryUntilSuccessful<T>(func: () => Promise<T>): Promise<T> {
  try {
    return await func();
  } catch (e) {
    await progressiveTimeout();
  }
  return tryUntilSuccessful(func);
}
