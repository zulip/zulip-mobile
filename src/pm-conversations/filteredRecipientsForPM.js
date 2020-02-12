/* @flow strict-local */
import type { Message, Outbox, User, PmRecipientUser } from '../types';

/**
 * Returns a filtered array of recipients for a private message.
 * If the message is a self PM, returns an array containing a single
 * element - the current user. Otherwise, returns all recipients
 * except the current user.
 */
export default (message: Message | Outbox, ownUser: User): PmRecipientUser[] =>
  message.display_recipient.length === 1 && message.display_recipient[0].email === ownUser.email
    ? message.display_recipient
    : message.display_recipient.filter(r => r.email !== ownUser.email);
