/* @flow strict-local */

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
export type Auth = $ReadOnly<{|
  realm: URL,
  apiKey: string,

  // TODO: Follow changes in the user's email address, whether while we're
  //   event polling or not.
  email: string,
|}>;

/**
 * The type shared by all Zulip API responses.
 *
 * See docs: https://zulip.com/api/rest-error-handling
 *
 * For more specific types, see:
 *  * {@link ApiResponseSuccess}
 *  * {@link ApiResponseErrorData}
 */
export type ApiResponse = $ReadOnly<{
  result: string,
  msg: string,
  ...
}>;

/**
 * The type shared by all non-error Zulip API responses.
 *
 * See docs: https://zulip.com/api/rest-error-handling
 *
 * See also:
 *  * {@link ApiResponse}
 *  * {@link ApiResponseErrorData}
 */
export type ApiResponseSuccess = $ReadOnly<{
  result: 'success',
  msg: '',
  ...
}>;

/**
 * An identifier-like string identifying a Zulip API error.
 *
 * See API docs on error handling:
 *   https://zulip.com/api/rest-error-handling
 *
 * (And at present, 2022-01, those are rather buggy.  So see also:
 *   https://chat.zulip.org/#narrow/stream/378-api-design/topic/error.20docs/near/1308989
 * )
 *
 * A list of current error codes can be found at:
 *   https://github.com/zulip/zulip/blob/main/zerver/lib/exceptions.py
 *
 * Note that most possible values of `code` are not documented in the API,
 * and may change in future versions.  This is especially likely when an
 * error gives the generic `code: 'BAD_REQUEST'`.  When writing logic to
 * rely on a `code` value, it's best to make sure it gets written into the
 * API documentation.
 */
// It's tempting to make ApiErrorCode an enumerated type, but: when
// connecting to newer Zulip servers, we may see values of `code` not known
// to this version of the client!
//
// (Note that "newer" here doesn't necessarily mean "newer than this client",
// but "newer than the last time someone updated the error code list from the
// server". We have no mechanism in place to share the set of error codes --
// and, given the facts above, it's not clear that the existence of such a
// mechanism would be helpful anyway.)
export type ApiErrorCode = string;

/**
 * Response from the API in case of an error.
 *
 * @prop code - A string error code, one of several predefined values. Defaults
 *  to 'BAD_REQUEST'. See {@link ApiErrorCode} for details.
 * @prop msg - Human-readable error message. May be localized, and so is not
 *    suitable for programmatic use; use 'code' instead.
 *
 * This type is not exact: some error responses may contain additional data.
 */
export type ApiResponseErrorData = $ReadOnly<{
  code: ApiErrorCode,
  msg: string,
  result: 'error',
  ...
}>;
