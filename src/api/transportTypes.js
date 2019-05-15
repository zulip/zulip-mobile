/* @flow strict */

export type Auth = {|
  realm: string,
  apiKey: string,
  email: string,
|};

export type ApiResponse = {|
  result: string,
  msg: string,
|};

export type ApiResponseSuccess = {|
  result: 'success',
  msg: '',
|};

/** List of error codes at https://github.com/zulip/zulip/blob/master/zerver/lib/exceptions.py */
export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'REQUEST_VARIABLE_MISSING'
  | 'REQUEST_VARIABLE_INVALID'
  | 'BAD_IMAGE'
  | 'REALM_UPLOAD_QUOTA'
  | 'BAD_NARROW'
  | 'MISSING_HTTP_EVENT_HEADER'
  | 'STREAM_DOES_NOT_EXIST'
  | 'UNAUTHORIZED_PRINCIPAL'
  | 'UNEXPECTED_WEBHOOK_EVENT_TYPE'
  | 'BAD_EVENT_QUEUE_ID'
  | 'CSRF_FAILED'
  | 'INVITATION_FAILED'
  | 'INVALID_ZULIP_SERVER';

/**
 * Response from the API in case of an error.
 *
 * @prop code - A string error code, enum of several predefined values. See ApiErrorCode.
 *   Not all error response types include that value.
 * @prop msg - Human readable error message. While we try to provide custom error code,
 *   as a last resort or for diagnostics, can be shown to the user.
 *   This is a locallized value. To determine the error type, it should not be compared
 *   against a known string. Use 'code' instead.
 */
export type ApiResponseError = {|
  code?: ApiErrorCode,
  msg: string,
  result: 'error',
|};

/**
 * Response from the event queue in case of an error.
 *
 * @prop queue_id - String uniquely identifying the queue. Available in addition to
 *   the usual error message information.
 */
export type ApiEventQueueResponseError = {|
  ...ApiResponseError,
  queue_id: string,
|};
