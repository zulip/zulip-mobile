/* @flow strict-local */
// $FlowFixMe[untyped-import]
import isEqual from 'lodash.isequal';

import { mapOrNull } from '../collections';
import * as logging from './logging';
import type {
  PmRecipientUser,
  Message,
  StreamMessage,
  PmMessage,
  Outbox,
  StreamOutbox,
  PmOutbox,
  UserId,
  UserOrBot,
} from '../types';

/**
 * The stream name a stream message was sent to.
 *
 * BUG(#5208): This is as of whenever we learned about the message;
 *   it doesn't get updated if the stream is renamed.
 */
export const streamNameOfStreamMessage = (message: StreamMessage | StreamOutbox): string =>
  message.display_recipient;

/**
 * The recipients of a PM, in the form found on PmMessage.
 *
 * BUG(#5208): This is as of whenever we learned about the message;
 *   it doesn't get updated if one of these users changes their
 *   name, email, avatar, or other details.
 */
export const recipientsOfPrivateMessage = (
  message: PmMessage | PmOutbox,
): $ReadOnlyArray<PmRecipientUser> => message.display_recipient;

/**
 * A list of users identifying a PM conversation, as per pmKeyRecipientsFromMessage.
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
export opaque type PmKeyRecipients: $ReadOnlyArray<UserId> = $ReadOnlyArray<UserId>;

/**
 * A list of users identifying a PM conversation, as per pmKeyRecipientsFromMessage.
 *
 * This is just like `PmKeyRecipients` but with a different selection of
 * details about the users.  See there for discussion.
 *
 * See also `pmNarrowFromUsers`, which requires a value of this type.
 */
export opaque type PmKeyUsers: $ReadOnlyArray<UserOrBot> = $ReadOnlyArray<UserOrBot>;

/** Convert from user objects to user IDs for identifying a PM conversation. */
export const pmKeyRecipientsFromPmKeyUsers = (recipients: PmKeyUsers): PmKeyRecipients =>
  recipients.map(r => r.user_id);

/**
 * The list of users identifying a 1:1 PM conversation, possibly with self.
 *
 * `userId` should be the self user for the self-1:1 conversation, or the
 * other user in a non-self 1:1 conversation.
 */
// (The fact that this function doesn't call for `ownUserId` as an argument
// basically exposes our choice of internal representation for both self-1:1
// and other 1:1 conversations.  So be it.  If we ever feel a need to change
// that, we can always refactor this function and its callers then.)
export const pmKeyRecipientsFor1to1 = (userId: UserId): PmKeyRecipients => [userId];

/**
 * Declare, **unchecked**, that a list of users identifies a PM conversation.
 *
 * This function bypasses our filtering logic for finding the right set of
 * users to identify the conversation according to our convention.  The
 * caller is responsible for ensuring that the invariant nevertheless holds.
 */
export const makePmKeyRecipients_UNSAFE = (recipients: $ReadOnlyArray<UserId>): PmKeyRecipients =>
  recipients;

// Filter a list of PM recipients in the quirky way that we do, and sort.
//
// Specifically: all users, except the self-user, except if it's the
// self-1:1 thread then include the self-user after all.  Then sort by ID.
//
// This is a module-private helper.  See callers for what this set of
// conditions *means* -- two different things, in fact, that have the same
// behavior by coincidence.
const filterRecipients = (
  recipients: $ReadOnlyArray<PmRecipientUser>,
  ownUserId: UserId,
): $ReadOnlyArray<PmRecipientUser> =>
  recipients.length === 1
    ? recipients
    : recipients.filter(r => r.id !== ownUserId).sort((a, b) => a.id - b.id);

// Like filterRecipients, but on user IDs directly.
const filterRecipientsAsUserIds = (
  recipients: $ReadOnlyArray<UserId>,
  ownUserId: UserId,
): $ReadOnlyArray<UserId> =>
  recipients.length === 1
    ? recipients
    : recipients.filter(r => r !== ownUserId).sort((a, b) => a - b);

/**
 * The same list of users as pmKeyRecipientsFromMessage, in quirkier form.
 */
// Note that sorting by user ID is the same as the server does for group PMs
// (see comment on Message#display_recipient).  Then for 1:1 PMs the
// server's behavior is quirkier... but we keep only one user for those
// anyway, so it doesn't matter.
export const normalizeRecipientsAsUserIdsSansMe = (
  recipients: $ReadOnlyArray<UserId>,
  ownUserId: UserId,
): string => filterRecipientsAsUserIds(recipients, ownUserId).join(',');

/**
 * The set of users to show in the UI to identify a PM conversation.
 *
 * See also:
 *  * `pmKeyRecipientsFromMessage`, which should be used when a consistent,
 *    unique key is needed for identifying different PM conversations in our
 *    data structures.
 *  * `pmUiRecipientsFromKeyRecipients`, which takes a `PmKeyRecipients`
 *    as input instead of a message.
 *
 * BUG(#5208): This is as of whenever we learned about the message;
 *   it doesn't get updated if one of these users changes their
 *   name, email, avatar, or other details.
 */
export const pmUiRecipientsFromMessage = (
  message: PmMessage | PmOutbox,
  ownUserId: UserId,
): $ReadOnlyArray<PmRecipientUser> =>
  filterRecipients(recipientsOfPrivateMessage(message), ownUserId);

/**
 * The set of users to show in the UI to identify a PM conversation.
 *
 * This produces the same set of users as `pmUiRecipientsFromMessage`,
 * just from a different form of input.  See there for more discussion.
 */
export const pmUiRecipientsFromKeyRecipients = (
  recipients: PmKeyRecipients,
  ownUserId: UserId,
): $ReadOnlyArray<UserId> =>
  // As it happens, the representation we use in PmKeyRecipients is the same
  // as we want in the UI:
  //  * for the self-1:1 conversation, just the self user;
  //  * for other 1:1 conversations, the other user;
  //  * for group PM conversations, all the other users.
  recipients;

/**
 * The list of users to identify a PM conversation by in our data structures.
 *
 * This produces the same list of users as `pmKeyRecipientsFromMessage`,
 * just from a different form of input.  See there for more discussion.
 */
export const pmKeyRecipientsFromIds = (
  userIds: $ReadOnlyArray<UserId>,
  ownUserId: UserId,
): PmKeyRecipients => filterRecipientsAsUserIds(userIds, ownUserId);

/**
 * The list of users to identify a PM conversation by in our data structures.
 *
 * This list is sorted by user ID.
 *
 * Typically we go on to take either the emails or user IDs in the result,
 * stringify them, and join with `,` to produce a string key.  IDs are
 * preferred; see #3764.
 *
 * See also:
 *  * `pmUiRecipientsFromMessage`, which gives a set of users to show in the
 *    UI.
 *
 *  * The `Narrow` type and its constructors in `narrow.js`, which we use to
 *    make keys to identify narrows in general, including stream and topic
 *    narrows.
 *
 *  * The other `pmKeyRecipients…` functions in this module, which do the
 *    same computation but with different forms of input and output.
 *
 *  * `normalizeRecipientsAsUserIdsSansMe` and `pmUnreadsKeyFromMessage`,
 *    which do the same job as this function with slight variations, and
 *    which we variously use in different places in the app.
 *
 *    It would be great to unify on a single version, as the variation is a
 *    possible source of bugs.
 */
// The list would actually be sorted even without explicit sorting, because:
//  * For group PMs, the server provides them in that order; see comment
//    on Message#display_recipient.
//  * For 1:1 PMs, we only keep one user in the list.
// But we also sort them ourselves, so as not to rely on that fact about
// the server; it's easy enough to do.
export const pmKeyRecipientsFromMessage = (
  message: PmMessage | PmOutbox,
  ownUserId: UserId,
): PmKeyRecipients =>
  pmKeyRecipientsFromIds(
    recipientsOfPrivateMessage(message).map(r => r.id),
    ownUserId,
  );

/**
 * The list of users to identify a PM conversation by in our data structures.
 *
 * This produces the same list of users as `pmKeyRecipientsFromMessage`, just
 * from a different form of input.
 *
 * The input may either include or exclude self, without affecting the
 * result.
 *
 * Returns null when a user couldn't be found in the given `allUsersById`.
 */
export const pmKeyRecipientUsersFromIds = (
  userIds: $ReadOnlyArray<UserId>,
  allUsersById: Map<UserId, UserOrBot>,
  ownUserId: UserId,
): PmKeyUsers | null => {
  const resultIds = userIds.filter(id => id !== ownUserId);
  if (resultIds.length === 0) {
    resultIds.push(ownUserId);
  }

  const users = mapOrNull(resultIds, id => allUsersById.get(id));
  if (!users) {
    logging.warn('pmKeyRecipientUsersFromIds: missing data on user');
    return null;
  }
  return users.sort((a, b) => a.user_id - b.user_id);
};

/**
 * Just like pmKeyRecipientsFromMessage, but in a slightly different format.
 */
export const pmKeyRecipientUsersFromMessage = (
  message: PmMessage | PmOutbox,
  allUsersById: Map<UserId, UserOrBot>,
  ownUserId: UserId,
): PmKeyUsers | null => {
  const userIds = recipientsOfPrivateMessage(message).map(r => r.id);
  return pmKeyRecipientUsersFromIds(userIds, allUsersById, ownUserId);
};

/**
 * Just like pmKeyRecipientsFromMessage, but from a different form of input.
 */
export const pmKeyRecipientsFromUsers = (
  users: $ReadOnlyArray<UserOrBot>,
  ownUserId: UserId,
): PmKeyRecipients =>
  pmKeyRecipientsFromIds(
    users.map(u => u.user_id),
    ownUserId,
  );

/**
 * The key this PM is filed under in the "unread messages" data structure.
 *
 * Note this diverges slightly from pmKeyRecipientsFromMessage in its
 * behavior -- it encodes a different set of users.
 *
 * See also:
 *  * `pmKeyRecipientsFromMessage`, which we use for other data structures.
 *  * `pmUnreadsKeyFromPmKeyIds`, for getting one of these keys given what
 *    we use for other data structures.
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
export const pmUnreadsKeyFromMessage = (message: PmMessage, ownUserId?: UserId): string => {
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

/**
 * The key for a PM thread in "unreads" data, given the key we use elsewhere.
 *
 * This produces the same key string that `pmUnreadsKeyFromMessage` would
 * give, given the list of users that `pmKeyRecipientsFromMessage` would
 * give and which we use in most of our other data structures.
 *
 * Careful: This is a *string key*. Don't === against numeric `.sender_id`s
 * in UnreadPmsState. You won't find the object you're looking for, and Flow
 * won't complain.
 */
// See comment on pmUnreadsKeyFromMessage for details on this form.
export const pmUnreadsKeyFromPmKeyIds = (userIds: PmKeyRecipients, ownUserId: UserId): string => {
  if (userIds.length === 1) {
    // A 1:1 PM.  Both forms include just one user: the other user if any,
    //   and self for a self-1:1.
    return userIds[0].toString();
  } else {
    // A group PM.  Our main "key" form includes just the other users;
    //   this form includes all users.
    return [...userIds, ownUserId].sort((a, b) => a - b).join(',');
  }
};

/**
 * The key for a PM thread in typing-status data, given the IDs we use generally.
 *
 * This produces the key string we use in `state.typing`, given the list of
 * users that `pmKeyRecipientsFromMessage` would provide and that we use in
 * most of our other data structures indexed on narrows.
 *
 * See also `pmTypingKeyFromRecipients`.
 */
// That key string is: just the usual "PM key" list of users, stringified
// and comma-separated.
export const pmTypingKeyFromPmKeyIds = (userIds: PmKeyRecipients): string => userIds.join(',');

/**
 * The key for a PM thread in typing-status data, given a recipients list.
 *
 * This produces the key string we use in `state.typing`, given the list of
 * users that a typing-status event provides in `recipients`.
 *
 * See also `pmTypingKeyFromPmKeyIds`.
 */
// This implementation works because:
//  * For all but self-PMs, we want the list of non-self users, which
//    `filterRecipientsAsUserIds` will give regardless of whether self was
//    in the input.  (So it doesn't matter what convention the server uses
//    for these events.)
//  * Self-PMs don't have typing-status events in the first place.
export const pmTypingKeyFromRecipients = (
  recipients: $ReadOnlyArray<UserId>,
  ownUserId: UserId,
): string => pmTypingKeyFromPmKeyIds(filterRecipientsAsUserIds(recipients, ownUserId));

export const isSameRecipient = (
  message1: Message | Outbox,
  message2: Message | Outbox,
): boolean => {
  switch (message1.type) {
    case 'private':
      if (message2.type !== 'private') {
        return false;
      }

      // We rely on the recipients being listed in a consistent order
      // between different messages in the same PM conversation.  The server
      // is indeed consistent to that degree; see comments on the Message
      // type.  But:
      //
      // TODO: This can wrongly return false if the recipients come in a
      //   different order.  In particular this happens if there's a real
      //   Message, then an Outbox message, to the same 1:1 PM thread (other
      //   than self-1:1.)  The effect is that if you send a 1:1, then go
      //   visit an interleaved narrow where it appears, you may see an
      //   extraneous recipient header.
      //
      //   We could fix that by sorting, but this is in a hot loop where
      //   we're already doing too much computation.  Instead, we should
      //   store an unambiguous ===-comparable key on each message to
      //   identify its conversation, and sort when computing that.  Until
      //   then, we just tolerate this glitch in that edge case.
      return isEqual(
        recipientsOfPrivateMessage(message1).map(r => r.id),
        recipientsOfPrivateMessage(message2).map(r => r.id),
      );
    case 'stream':
      if (message2.type !== 'stream') {
        return false;
      }

      return (
        message1.stream_id === message2.stream_id
        && message1.subject.toLowerCase() === message2.subject.toLowerCase()
      );
    default:
      // Invariant
      return false;
  }
};
