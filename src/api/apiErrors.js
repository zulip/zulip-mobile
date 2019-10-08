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
  // Validate `data`, and construct the resultant error object.
  if (typeof data === 'object' && data !== null) {
    if (data.result === 'error' && typeof data.msg === 'string') {
      // If `code` is present, it must be a string.
      if (!('code' in data) || typeof data.code === 'string') {
        // Default to 'BAD_REQUEST' if `code` is not present.
        return new ApiError(httpStatus, { code: 'BAD_REQUEST', ...data });
      }
    }
  }

  // Server has responded, but the response is not a valid error-object.
  // (This should never happen, even on old versions of the Zulip server.)
  logging.warn(`Bad response from server: ${JSON.stringify(data)}`);
  return new Error('Server responded with invalid message');
};
