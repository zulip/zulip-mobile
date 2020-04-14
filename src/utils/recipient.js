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

export const normalizeRecipientsSansMe = (
  recipients: $ReadOnlyArray<{ email: string, ... }>,
  ownEmail: string,
) =>
  recipients.length === 1
    ? recipients[0].email
    : normalizeRecipients(recipients.filter(r => r.email !== ownEmail));

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
 *    `getRecipientsIds`, which do the same job as this function with slight
 *    variations, and which we variously use in different places in the app.
 *
 *    It would be great to unify on a single version, as the variation is a
 *    possible source of bugs.
 */
export const pmKeyRecipientsFromMessage = (
  message: Message | Outbox,
  ownUser: User,
): PmRecipientUser[] => {
  if (message.type !== 'private') {
    throw new Error('pmKeyRecipientsFromMessage: expected PM, got stream message');
  }
  return filterRecipients(message.display_recipient, ownUser.user_id);
};

export const getRecipientsIds = (message: Message, ownEmail?: string): string => {
  if (message.type !== 'private') {
    throw new Error('getRecipientsIds: expected PM, got stream message');
  }
  const recipients = message.display_recipient;
  if (recipients.length === 1) {
    return recipients[0].id.toString();
  } else if (recipients.length === 2) {
    if (ownEmail === undefined) {
      throw new Error('getRecipientsIds: got 1:1 PM, but ownEmail omitted');
    }
    return recipients.filter(r => r.email !== ownEmail)[0].id.toString();
  } else {
    return recipients
      .map(s => s.id)
      .sort((a, b) => a - b)
      .join(',');
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
