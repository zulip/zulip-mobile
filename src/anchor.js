/* @flow strict-local */

/**
 * A special value we internally take to mean "first unread message".
 *
 * In particular this is interpreted by the `fetchMessages*` functions in
 * `fetchActions.js` as meaning the underlying API request should set
 * `use_first_unread_anchor: true`.  (Which causes the actual `anchor` value
 * to be ignored.)
 */
// Awkwardly, this is a very different convention from the one understood by
// the Zulip server!  The latter takes `anchor: 0` literally -- and because
// no message has ID less than 0, it effectively means "the very first
// messages".
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
