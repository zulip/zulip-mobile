/* @flow strict-local */

/**
 * Pointer to the oldest message in a narrow.
 *
 * Usually, an anchor is a message ID. This constant can be used when we
 * want to retrieve the oldest messages for a narrow, without actually
 * knowing their IDs.
 */
export const FIRST_UNREAD_ANCHOR = 0;

/**
 * Pointer to the newest message in a narrow.
 *
 * Usually, an anchor is a message ID. This constant can be used when we
 * want to retrieve the newest messages for a narrow, without actually
 * knowing their IDs.
 */
// This special value is understood by the server, corresponding to
// LARGER_THAN_MAX_MESSAGE_ID there.  See #3654.
export const LAST_MESSAGE_ANCHOR = 10000000000000000; // sixteen zeroes
