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
export type Auth = {|
  realm: URL,
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

/**
 * A list of current error codes can be found at:
 *   https://github.com/zulip/zulip/blob/master/zerver/lib/exceptions.py
 *
 * Unfortunately, the `code` property is a relatively late addition to the
 * Zulip API, introduced for version 1.7.0. [1]  The modern default, when no
 * other code has been defined, is 'BAD_REQUEST'; we therefore synthesize
 * that value when connecting to old servers that don't provide an error
 * code.
 *
 * [1] Specifically at 1.7.0~2354 and ancestors, aka 9faa44af6^..709c3b50fc .
 *     See: https://github.com/zulip/zulip/commit/709c3b50fc
 *
 * It's tempting to make ApiErrorCode an enumerated type, save for the dual
 * problem: when connecting to _newer_ Zulip servers, we may see values of
 * `code` not known to this version of the client! In particular, new error
 * codes are occasionally assigned to existing classes of error which previously
 * returned 'BAD_REQUEST'.
 *
 * (Note that "newer" here doesn't necessarily mean "newer than this client",
 * but "newer than the last time someone updated the error code list from the
 * server". We have no mechanism in place to share the set of error codes --
 * and, given the facts above, it's not clear that the existence of such a
 * mechanism would be helpful anyway.)
 *
 * Though unstable in the general case, `code` is still useful.  It _is_
 * guaranteed to be stable for certain known classes of errors.
 * Nonetheless: let its user beware.
 */
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
export type ApiResponseErrorData = {
  code: ApiErrorCode,
  msg: string,
  result: 'error',
  ...
};
