/* @flow strict-local */
import type { PmRecipientUser, Message, Outbox, User } from '../types';

// Filter a list of PM recipients in the quirky way that we do.
//
// Specifically: all users, except the self-user, except if it's the
// self-1:1 thread then include the self-user after all.
//
// This is a module-private helper.  See callers for what this set of
// conditions *means* -- two different things, in fact, that have the same
// behavior by coincidence.
const filterRecipients = (recipients: PmRecipientUser[], ownUserId: number): PmRecipientUser[] =>
  recipients.length === 1 ? recipients : recipients.filter(r => r.id !== ownUserId);

// TODO types: this union is confusing
export const normalizeRecipients = (recipients: $ReadOnlyArray<{ email: string, ... }> | string) =>
  !Array.isArray(recipients)
    ? recipients
    : recipients
        .map(s => s.email.trim())
        .filter(x => x.length > 0)
        .sort()
        .join(',');

/**
 * The same set of users as pmKeyRecipientsFromMessage, in quirkier form.
 *
 * Prefer normalizeRecipientsAsUserIdsSansMe over this; see #3764.
 * See that function for further discussion.
 *
 * Users are sorted by email address.
 */
export const normalizeRecipientsSansMe = (
  recipients: $ReadOnlyArray<{ email: string, ... }>,
  ownEmail: string,
) =>
  recipients.length === 1
    ? recipients[0].email
    : normalizeRecipients(recipients.filter(r => r.email !== ownEmail));

export const normalizeRecipientsAsUserIds = (
  recipients: $ReadOnlyArray<{ user_id: number, ... }>,
) =>
  recipients
    .map(s => s.user_id)
    .sort()
    .join(',');

/**
 * The same set of users as pmKeyRecipientsFromMessage, in quirkier form.
 *
 * Sorted by user ID.
 */
// Note that sorting by user ID is the same as the server does for group PMs
// (see comment on Message#display_recipient).  Then for 1:1 PMs the
// server's behavior is quirkier... but we keep only one user for those
// anyway, so it doesn't matter.
export const normalizeRecipientsAsUserIdsSansMe = (
  recipients: $ReadOnlyArray<{ user_id: number, ... }>,
  ownUserId: number,
) =>
  recipients.length === 1
    ? recipients[0].user_id.toString()
    : normalizeRecipientsAsUserIds(recipients.filter(r => r.user_id !== ownUserId));

/**
 * The set of users to show in the UI to identify a PM conversation.
 *
 * See also:
 *  * `pmKeyRecipientsFromMessage`, which should be used when a consistent,
 *    unique key is needed for identifying different PM conversations in our
 *    data structures.
 */
export const pmUiRecipientsFromMessage = (
  message: Message | Outbox,
  ownUser: User,
): PmRecipientUser[] => {
  if (message.type !== 'private') {
    throw new Error('pmUiRecipientsFromMessage: expected PM, got stream message');
  }
  return filterRecipients(message.display_recipient, ownUser.user_id);
};

/**
 * The set of users to identify a PM conversation by in our data structures.
 *
 * Typically we go on to take either the emails or user IDs in the result,
 * stringify them, and join with `,` to produce a string key.  IDs are
 * preferred; see #3764.
 *
 * See also:
 *  * `pmUiRecipientsFromMessage`, which gives a set of users to show in the
 *    UI.
 *
 *  * The `Narrow` type and its constructors in `narrow.js`, which with
 *    `JSON.stringify` we use to make keys to identify narrows in general,
 *    including stream and topic narrows.
 *
 *  * `normalizeRecipients`, `normalizeRecipientsSansMe`, and
 *    `pmUnreadsKeyFromMessage`, which do the same job as this function with
 *    slight variations, and which we variously use in different places in
 *    the app.
 *
 *    It would be great to unify on a single version, as the variation is a
 *    possible source of bugs.
 */
// The resulting users are sorted by user ID.  That's because:
//  * For group PMs, the server provides them in that order; see comment
//    on Message#display_recipient.
//  * For 1:1 PMs, we only keep one user in the list.
export const pmKeyRecipientsFromMessage = (
  message: Message | Outbox,
  ownUser: User,
): PmRecipientUser[] => {
  if (message.type !== 'private') {
    throw new Error('pmKeyRecipientsFromMessage: expected PM, got stream message');
  }
  return filterRecipients(message.display_recipient, ownUser.user_id);
};

/**
 * The key this PM is filed under in the "unread messages" data structure.
 *
 * Note this diverges slightly from pmKeyRecipientsFromMessage in its
 * behavior -- it encodes a different set of users.
 *
 * See also:
 *  * `pmKeyRecipientsFromMessage`, which we use for other data structures.
 *  * `UnreadState`, the type of `state.unread`, which is the data structure
 *    these keys appear in.
 *
 * @param ownUserId - Required if the message could be a 1:1 PM; optional if
 *   it is definitely a group PM.
 */
// Specifically, this includes all user IDs for group PMs and self-PMs,
// and just the other user ID for non-self 1:1s; and in each case the list
// is sorted numerically and encoded in ASCII-decimal, comma-separated.
// See the `unread_msgs` data structure in `src/api/initialDataTypes.js`.
export const pmUnreadsKeyFromMessage = (message: Message, ownUserId?: number): string => {
  if (message.type !== 'private') {
    throw new Error('pmUnreadsKeyFromMessage: expected PM, got stream message');
  }
  const recipients: PmRecipientUser[] = message.display_recipient;
  // This includes all users in the thread; see `Message#display_recipient`.
  const userIds = recipients.map(r => r.id);

  if (userIds.length === 1) {
    // Self-PM.
    return userIds[0].toString();
  } else if (userIds.length === 2) {
    // Non-self 1:1 PM.  Unlike display_recipient, leave out the self user.
    if (ownUserId === undefined) {
      throw new Error('getRecipientsIds: got 1:1 PM, but ownUserId omitted');
    }
    return userIds.filter(userId => userId !== ownUserId)[0].toString();
  } else {
    // Group PM.
    return userIds.sort((a, b) => a - b).join(',');
  }
};

export const isSameRecipient = (
  message1: Message | Outbox,
  message2: Message | Outbox,
): boolean => {
  if (message1 === undefined || message2 === undefined) {
    return false;
  }

  if (message1.type !== message2.type) {
    return false;
  }

  switch (message1.type) {
    case 'private':
      return (
        normalizeRecipients(message1.display_recipient).toLowerCase()
        === normalizeRecipients(message2.display_recipient).toLowerCase()
      );
    case 'stream':
      return (
        message1.display_recipient.toLowerCase() === message2.display_recipient.toLowerCase()
        && message1.subject.toLowerCase() === message2.subject.toLowerCase()
      );
    default:
      // Invariant
      return false;
  }
};
