/* @flow */
import { Recipient, Narrow, Message } from '../types';

export const normalizeRecipients = (recipients: Recipient[]) =>
  (!Array.isArray(recipients) ?
    recipients :
    recipients
      .map((s) => s.email.trim())
      .filter(x => x.length > 0)
      .sort()
      .join(','));

export const normalizeRecipientsSansMe = (recipients: Recipient[], selfEmail: string) => (
  recipients.length === 1 ?
    recipients[0].email :
    normalizeRecipients(recipients.filter(r => r.email !== selfEmail))
);

export const isSameRecipient = (message1: Message, message2: Message): boolean => {
  if (message1 === undefined || message2 === undefined) {
    return false;
  }

  if (message1.type !== message2.type) {
    return false;
  }

  switch (message1.type) {
    case 'private':
      return (normalizeRecipients(message1.display_recipient).toLowerCase() ===
              normalizeRecipients(message2.display_recipient).toLowerCase());
    case 'stream':
      return (
        message1.display_recipient.toLowerCase() === message2.display_recipient.toLowerCase() &&
        message1.subject.toLowerCase() === message2.subject.toLowerCase()
      );
    default:
      // Invariant
      return false;
  }
};

export const isTopicMuted = (message: Message, mute: string[] = []): boolean => {
  if (typeof message.display_recipient !== 'string') {
    return false; // private/group messages are not muted
  }
  return mute.some(x => x[0] === message.display_recipient && x[1] === message.subject);
};

export const shouldBeMuted = (
  message: Message,
  narrow: Narrow,
  subscriptions: any[],
  mutes: string[] = []
): boolean => {
  if (typeof message.display_recipient !== 'string') {
    return false; // private/group messages are not muted
  }

  if (narrow.length === 0) {
    const sub = subscriptions.find(x => x.name === message.display_recipient);
    if (sub && !sub.in_home_view) {
      return true;
    }
  }

  return mutes.some(x => x[0] === message.display_recipient && x[1] === message.subject);
};
