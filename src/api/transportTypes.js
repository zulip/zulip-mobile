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

export type ApiResponseError = {|
  code?: ApiErrorCode,
  msg: string,
  result: 'error',
|};
