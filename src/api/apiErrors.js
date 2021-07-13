/* @flow strict-local */
import type { ApiErrorCode, ApiResponseErrorData } from './transportTypes';
import * as logging from '../utils/logging';

/**
 * An error returned by the Zulip server API.
 *
 * This always represents a situation where the server said there was a
 * client-side error in the request, giving a 4xx HTTP status code.
 *
 * See docs: https://zulip.com/api/rest-error-handling
 */
// TODO we currently raise these in more situations; fix that.
export class ApiError extends Error {
  +code: ApiErrorCode;

  +httpStatus: number;

  /**
   * This error's data, if any, beyond the properties common to all errors.
   *
   * This consists of the properties in the response other than `result`,
   * `code`, and `msg`.
   */
  +data: $ReadOnly<{ ... }>;

  constructor(httpStatus: number, data: $ReadOnly<ApiResponseErrorData>) {
    // eslint-disable-next-line no-unused-vars
    const { result, code, msg, ...rest } = data;
    super(msg);
    this.data = rest;
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

/**
 * Some kind of server-side error in handling the request.
 *
 * This should always represent either some kind of operational issue on the
 * server, or a bug in the server where its responses don't agree with the
 * documented API.
 */
export class ServerError extends Error {
  +httpStatus: number;

  constructor(msg: string, httpStatus: number) {
    super(msg);
    this.httpStatus = httpStatus;
  }
}

/**
 * A server error, acknowledged by the server via a 5xx HTTP status code.
 */
export class Server5xxError extends ServerError {
  constructor(httpStatus: number) {
    super(`Network request failed: HTTP error ${httpStatus}`, httpStatus);
  }
}

/**
 * Given a server response (allegedly) denoting an error, produce an Error to be
 * thrown.
 *
 * If the `data` argument is actually of the form expected from the server, the
 * returned error will be an {@link ApiError}.
 */
export const makeErrorFromApi = (httpStatus: number, data: mixed): Error => {
  if (httpStatus >= 500 && httpStatus <= 599) {
    // Server error.  Ignore `data`; it's unlikely to be a well-formed Zulip
    // API error blob, and its meaning is undefined if it somehow is.
    return new Server5xxError(httpStatus);
  }

  if (typeof data === 'object' && data !== null) {
    const { result, msg, code = 'BAD_REQUEST' } = data;
    if (result === 'error' && typeof msg === 'string' && typeof code === 'string') {
      // Hooray, we have a well-formed Zulip API error blob.  Use that.
      return new ApiError(httpStatus, { ...data, result, msg, code });
    }
  }

  // Server has responded, but the response is not a valid error-object.
  // (This should never happen, even on old versions of the Zulip server.)
  logging.warn(`Bad response from server: ${JSON.stringify(data) ?? 'undefined'}`);
  return new Error('Server responded with invalid message');
};

/**
 * Is exception caused by a Client Error (4xx)?
 *
 * Client errors are often caused by incorrect parameters given to the backend
 * by the client application.
 *
 * A notable difference between a Server (5xx) and Client (4xx) errors is that
 * a client error will not be resolved by waiting and retrying the same request.
 */
export const isClientError = (e: Error): boolean =>
  e instanceof ApiError && e.httpStatus >= 400 && e.httpStatus <= 499;
