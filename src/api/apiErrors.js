/* @flow strict-local */
import { ExtendableError } from '../utils/logging';
import type { ApiErrorCode, ApiResponseErrorData } from './transportTypes';

/**
 * Some kind of error from a Zulip API network request.
 *
 * See subclasses: {@link ApiError}, {@link NetworkError}, {@link ServerError}.
 */
export class RequestError extends ExtendableError {
  /** The HTTP status code in the response, if any. */
  +httpStatus: number | void;

  /**
   * The JSON-decoded response body.
   *
   * In the subclass {@link ApiError}, this is a bit narrower; see there.
   *
   * If there was no HTTP response or no body, or the body was not parseable
   * as JSON, this value is `undefined`.
   */
  +data: mixed;
}

/**
 * An error returned by the Zulip server API.
 *
 * This always represents a situation where the server said there was a
 * client-side error in the request, giving a 4xx HTTP status code, and
 * moreover sent a well-formed Zulip API error blob in the response.
 *
 * The error blob's contents are represented as follows:
 *  * `result`: Always 'error', if we have an `ApiError` at all.
 *  * `code`: This object's `.code`.
 *  * `msg`: This object's `.message` (which the type inherits from`Error`).
 *  * All other properties: This object's `.data`.
 *
 * See API docs: https://zulip.com/api/rest-error-handling
 */
export class ApiError extends RequestError {
  +code: ApiErrorCode;

  +httpStatus: number;

  /**
   * This error's data, if any, beyond the properties common to all errors.
   *
   * This consists of the properties in the (JSON-decoded) response other
   * than `result`, `code`, and `msg`.
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
 * A network-level error that prevented even getting an HTTP response.
 */
export class NetworkError extends RequestError {}

/**
 * Some kind of server-side error in handling the request.
 *
 * This should always represent either some kind of operational issue on the
 * server, or a bug in the server where its responses don't agree with the
 * documented API.
 */
export class ServerError extends RequestError {
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
    // This text is looked for by the `ignoreErrors` we pass to `Sentry.init`.
    // If changing this text, update the pattern there to match it.
    super(`Network request failed: HTTP status ${httpStatus}`, httpStatus);
  }
}

/**
 * An error where the server's response doesn't match the general Zulip API.
 *
 * This means the server's response didn't contain appropriately-shaped JSON
 * as documented at the page https://zulip.com/api/rest-error-handling .
 */
export class MalformedResponseError extends ServerError {
  constructor(httpStatus: number, data: mixed) {
    super(`Server responded with invalid message; HTTP status ${httpStatus}`, httpStatus);
    this.data = data;
  }
}

/**
 * An error where the server gave an HTTP status it should never give.
 *
 * That is, the HTTP status wasn't one that the docs say the server may
 * give: https://zulip.com/api/rest-error-handling
 */
export class UnexpectedHttpStatusError extends ServerError {
  constructor(httpStatus: number, data: mixed) {
    super(`Server gave unexpected HTTP status: ${httpStatus}`, httpStatus);
    this.data = data;
  }
}

/**
 * Return the data on success; otherwise, throw a nice {@link RequestError}.
 */
// For the spec this is implementing, see:
//   https://zulip.com/api/rest-error-handling
export const interpretApiResponse = (httpStatus: number, data: mixed): mixed => {
  if (httpStatus >= 200 && httpStatus <= 299) {
    // Status code says success…

    if (data === undefined) {
      // … but response couldn't be parsed as JSON.  Seems like a server bug.
      throw new MalformedResponseError(httpStatus, data);
    }

    // … and we got a JSON response, too.  So we can return the data.
    return data;
  }

  if (httpStatus >= 500 && httpStatus <= 599) {
    // Server error.  Ignore `data`; it's unlikely to be a well-formed Zulip
    // API error blob, and its meaning is undefined if it somehow is.
    throw new Server5xxError(httpStatus);
  }

  if (httpStatus >= 400 && httpStatus <= 499) {
    // Client error.  We should have a Zulip API error blob.

    if (typeof data === 'object' && data !== null) {
      // For errors `code` should always be present, but there have been
      // bugs where it was missing; in particular, on rate-limit errors
      // until Zulip 4.0: https://zulip.com/api/rest-error-handling .
      // Fall back to `BAD_REQUEST`, the same thing the server uses when
      // nobody's made it more specific.
      // TODO(server-4.0): Drop this fallback.
      const { result, msg, code = 'BAD_REQUEST' } = data;

      if (result === 'error' && typeof msg === 'string' && typeof code === 'string') {
        // Hooray, we have a well-formed Zulip API error blob.  Use that.
        throw new ApiError(httpStatus, { ...data, result, msg, code });
      }
    }

    // No such luck.  Seems like a server bug, then.
    throw new MalformedResponseError(httpStatus, data);
  }

  // HTTP status was none of 2xx, 4xx, or 5xx.  That's a server bug --
  // the API says that shouldn't happen.
  throw new UnexpectedHttpStatusError(httpStatus, data);
};
