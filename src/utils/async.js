/* @flow strict */
import progressiveTimeout from './progressiveTimeout';

/** Like setTimeout(..., 0), but returns a Promise of the result. */
export function delay<T>(callback: () => T): Promise<T> {
  return new Promise(resolve => resolve()).then(callback);
}

export const sleep = (ms: number = 0): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calls an async function and if unsuccessful retries the call.
 *
 * If the function is an API call and the response has HTTP status code 4xx
 * the error is considered unrecoverable and the exception is rethrown, to be
 * handled further up in the call stack.
 */
export async function tryUntilSuccessful<T>(func: () => Promise<T>): Promise<T> {
  try {
    return await func();
  } catch (e) {
    if (e.httpStatus !== undefined && e.httpStatus >= 400 && e.httpStatus <= 499) {
      // do not retry if error is 4xx (Client Error)
      throw e;
    }
    await progressiveTimeout();
  }
  return tryUntilSuccessful(func);
}
