/* @flow strict-local */
import type { ApiErrorCode, ApiResponseErrorData } from './transportTypes';
import * as logging from '../utils/logging';

/** Runtime class of custom API error types. */
export class ApiError extends Error {
  code: ApiErrorCode;
  data: $ReadOnly<{ ... }>;
  httpStatus: number;

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
 * Given a server response (allegedly) denoting an error, produce an Error to be
 * thrown.
 *
 * If the `data` argument is actually of the form expected from the server, the
 * returned error will be an {@link ApiError}; otherwise it will be a generic
 * Error.
 */
export const makeErrorFromApi = (httpStatus: number, data: mixed): Error => {
  if (httpStatus >= 500 && httpStatus <= 599) {
    // Server error.  Ignore `data`; it's unlikely to be a well-formed Zulip
    // API error blob, and its meaning is undefined if it somehow is.
    return new Error(`Network request failed: HTTP error ${httpStatus}`);
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
