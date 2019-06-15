/* @flow strict */

/**
 * An identity, plus secret, authenticating this user in some Zulip org.
 *
 * This consists of all the information the API client library needs in
 * order to talk to the server on the user's behalf.  All API functions
 * for making (authenticated) requests to the server require this as a
 * parameter.
 *
 * See also `Account` which the app uses to contain this information plus
 * other metadata.
 *
 * Prefer using `Identity` where possible, which identifies the user but
 * leaves out the secret API key; use `identityOfAuth` to extract one from
 * an `Auth`.
 */
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
