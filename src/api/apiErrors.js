/* @flow strict-local */
import type { ApiErrorCode, ApiResponseErrorData } from './transportTypes';
import * as logging from '../utils/logging';
import type { UrlParams } from '../utils/url';

/** An API call, preserved for logging purposes. */
export type CallData = {| route: string, method: string, params: UrlParams |};

/** Runtime class of custom API error types. */
export class ApiError extends Error {
  call: CallData;
  code: ApiErrorCode;
  data: $ReadOnly<{ ... }>;
  httpStatus: number;

  constructor(call: CallData, httpStatus: number, data: $ReadOnly<ApiResponseErrorData>) {
    // eslint-disable-next-line no-unused-vars
    const { result, code, msg, ...rest } = data;
    super(msg);
    this.call = call;
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
export const makeErrorFromApi = (call: CallData, httpStatus: number, data: mixed): Error => {
  // Validate `data`, and construct the resultant error object.
  if (typeof data === 'object' && data !== null) {
    if (data.result === 'error' && typeof data.msg === 'string') {
      // If `code` is present, it must be a string.
      if (!('code' in data) || typeof data.code === 'string') {
        // Default to 'BAD_REQUEST' if `code` is not present.
        return new ApiError(call, httpStatus, { code: 'BAD_REQUEST', ...data });
      }
    }
  }

  // HTTP 5xx errors aren't generally expected to come with JSON data.
  if (httpStatus >= 500 && httpStatus <= 599) {
    return new Error(`Network request failed: HTTP error ${httpStatus}`);
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
