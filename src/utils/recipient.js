/* @flow strict-local */
import invariant from 'invariant';

import type { PmRecipientUser, Message, Outbox, User, UserOrBot } from '../types';
import * as logging from './logging';

/** The stream name a stream message was sent to.  Throws if a PM. */
export const streamNameOfStreamMessage = (message: Message | Outbox): string => {
  if (message.type !== 'stream') {
    throw new Error('streamNameOfStreamMessage: got PM');
  }
  const { display_recipient: streamName } = message;
  invariant(typeof streamName === 'string', 'message type / display_recipient mismatch');
  return streamName;
};

/** The recipients of a PM, in the form found on Message.  Throws if a stream message. */
export const recipientsOfPrivateMessage = (
  message: Message | Outbox,
): $ReadOnlyArray<PmRecipientUser> => {
  if (message.type !== 'private') {
    throw new Error('recipientsOfPrivateMessage: got stream message');
  }
  const { display_recipient: recipients } = message;
  invariant(typeof recipients === 'object', 'message type / display_recipient mismatch');
  return recipients;
};

/**
 * A set of users identifying a PM conversation, as per pmKeyRecipientsFromMessage.
 *
 * This is an "opaque type alias" for an array of plain old data.
 * See Flow docs: https://flow.org/en/docs/types/opaque-types/
 *
 * That means:
 *  * For code outside this module, it's some unknown subtype of the given
 *    array type.
 *  * Secretly, it actually is just that array type, and code inside this
 *    module can see that.
 *  * (In general, the public type bound and the secret underlying type can
 *    be different, but in this case we've made them the same.)
 *
 * As a result:
 *  * The only way to produce a value of this type is with code inside this
 *    module.  (For code outside the module, the secret underlying type
 *    could have any number of requirements it can't see; it could even be
 *    `empty`, which has no values.)
 *  * But code outside this module can still freely *consume* the data in a
 *    value of this type, just like any other value of the given array type.
 *
 * Or to say the same things from a different angle:
 *  * For code inside this module, this is just like a normal type alias,
 *    to the secret/private underlying type.
 *  * For code outside this module trying to produce a value of this type,
 *    it's a brick wall -- it's effectively like the `empty` type.
 *  * For code outside this module trying to consume a value of this type,
 *    it's just like a normal type alias to the public type bound; which in
 *    this case we've chosen to make the same as the private underlying type.
 *
 * See also `pmNarrowFromRecipients`, which requires a value of this type.
 */
export opaque type PmKeyRecipients: $ReadOnlyArray<PmRecipientUser> = $ReadOnlyArray<PmRecipientUser>;

// Filter a list of PM recipients in the quirky way that we do.
//
// Specifically: all users, except the self-user, except if it's the
// self-1:1 thread then include the self-user after all.
//
// This is a module-private helper.  See callers for what this set of
// conditions *means* -- two different things, in fact, that have the same
// behavior by coincidence.
const filterRecipients = (
  recipients: $ReadOnlyArray<PmRecipientUser>,
  ownUserId: number,
): $ReadOnlyArray<PmRecipientUser> =>
  recipients.length === 1 ? recipients : recipients.filter(r => r.id !== ownUserId);

// Like filterRecipients, but on user IDs directly.
const filterRecipientsAsUserIds = <T: $ReadOnlyArray<number>>(
  recipients: T,
  ownUserId: number,
): T => (recipients.length === 1 ? recipients : recipients.filter(r => r !== ownUserId));

// Like filterRecipients, but identifying users by email address.
// Prefer filterRecipients instead.
const filterRecipientsByEmail = <T: { +email: string, ... }>(
  recipients: $ReadOnlyArray<T>,
  ownEmail: string,
): $ReadOnlyArray<T> =>
  recipients.length === 1 ? recipients : recipients.filter(r => r.email !== ownEmail);

/** PRIVATE -- exported only for tests. */
export const normalizeRecipients = (recipients: $ReadOnlyArray<{ +email: string, ... }>) => {
  const emails = recipients.map(r => r.email);

  if (emails.some(e => e.trim() !== e)) {
    // This should never happen -- it makes the email address invalid.  If
    // there's some user input that might be accepted like this, it should
    // be turned into a valid email address long before this point.  We
    // include this defensive logic only out of an abundance of caution
    // because we had it, with no logging, for a long time.
    logging.error('normalizeRecipients: got email with whitespace', { emails });
  }
  if (emails.some(e => !e)) {
    // This should similarly never happen -- it means we got an
    // unrecoverably bogus email address in here.  We carry on hoping, or
    // pretending, that it just shouldn't have been in the list at all.
    logging.error('normalizeRecipients: got empty email', { emails });
  }
  // Both of these fudge conditions should really go away.  We can do that
  // after we've had a release out in the wild with the above logging for at
  // least a few weeks, and seen no reports of them actually happening.
  // Until then, conservatively keep fudging like we have for a long time.
  const massagedEmails = emails.map(e => e.trim()).filter(Boolean);

  return massagedEmails.sort().join(',');
};

/**
 * The same set of users as pmKeyRecipientsFromMessage, in quirkier form.
 *
 * Prefer normalizeRecipientsAsUserIdsSansMe over this; see #3764.
 * See that function for further discussion.
 *
 * Users are sorted by email address.
 */
export const normalizeRecipientsSansMe = (
  recipients: $ReadOnlyArray<{ +email: string, ... }>,
  ownEmail: string,
) => normalizeRecipients(filterRecipientsByEmail(recipients, ownEmail));

export const normalizeRecipientsAsUserIds = (recipients: number[]) =>
  recipients.sort((a, b) => a - b).join(',');

/**
 * The same set of users as pmKeyRecipientsFromMessage, in quirkier form.
 *
 * Sorted by user ID.
 */
// Note that sorting by user ID is the same as the server does for group PMs
// (see comment on Message#display_recipient).  Then for 1:1 PMs the
// server's behavior is quirkier... but we keep only one user for those
// anyway, so it doesn't matter.
export const normalizeRecipientsAsUserIdsSansMe = (recipients: number[], ownUserId: number) =>
  normalizeRecipientsAsUserIds(filterRecipientsAsUserIds(recipients, ownUserId));

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
): $ReadOnlyArray<PmRecipientUser> => {
  if (message.type !== 'private') {
    throw new Error('pmUiRecipientsFromMessage: expected PM, got stream message');
  }
  return filterRecipients(recipientsOfPrivateMessage(message), ownUser.user_id);
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
): PmKeyRecipients => {
  if (message.type !== 'private') {
    throw new Error('pmKeyRecipientsFromMessage: expected PM, got stream message');
  }
  return filterRecipients(recipientsOfPrivateMessage(message), ownUser.user_id);
};

/**
 * The set of users to identify a PM conversation by in our data structures.
 *
 * This produces the same set of users as `pmKeyRecipientsFromMessage`, just
 * from a different form of input.
 *
 * The input may either include or exclude self, without affecting the
 * result.
 */
export const pmKeyRecipientsFromIds = (
  userIds: number[],
  allUsersById: Map<number, UserOrBot>,
  ownUserId: number,
): UserOrBot[] | null => {
  const users = [];
  for (const id of userIds) {
    if (id === ownUserId && userIds.length > 1) {
      continue;
    }
    const user = allUsersById.get(id);
    if (!user) {
      return null;
    }
    users.push(user);
  }
  return users;
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
  const recipients = recipientsOfPrivateMessage(message);

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
        normalizeRecipients(recipientsOfPrivateMessage(message1)).toLowerCase()
        === normalizeRecipients(recipientsOfPrivateMessage(message2)).toLowerCase()
      );
    case 'stream':
      return (
        streamNameOfStreamMessage(message1).toLowerCase()
          === streamNameOfStreamMessage(message2).toLowerCase()
        && message1.subject.toLowerCase() === message2.subject.toLowerCase()
      );
    default:
      // Invariant
      return false;
  }
};
