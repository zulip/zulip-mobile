/* @flow */
import type { Recipient, Narrow, Message, MuteState, Subscription } from '../types';
import { homeNarrow } from './narrow';

export const normalizeRecipients = (recipients: Recipient[]) =>
  !Array.isArray(recipients)
    ? recipients
    : recipients
        .map(s => s.email.trim())
        .filter(x => x.length > 0)
        .sort()
        .join(',');

export const normalizeRecipientsName = (recipients: Recipient[]) =>
  !Array.isArray(recipients)
    ? recipients
    : recipients
        .map(s => s.full_name.trim())
        .filter(x => x.length > 0)
        .sort()
        .join(',');

export const normalizeRecipientsSansMe = (recipients: Recipient[], ownEmail: string) =>
  recipients.length === 1
    ? recipients[0].email
    : normalizeRecipients(recipients.filter(r => r.email !== ownEmail));

export const normalizeRecipientsNamesSansMe = (recipients: Recipient[], ownEmail: string) =>
  recipients.length === 1
    ? recipients[0].email
    : normalizeRecipientsName(recipients.filter(r => r.email !== ownEmail));

export const getRecipientsIds = (recipients: Recipient[], ownEmail?: string): string =>
  recipients.length === 2
    ? recipients.filter(r => r.email !== ownEmail)[0].id.toString()
    : recipients
        .map(s => s.id)
        .sort((a, b) => a - b)
        .join(',');

export const isSameRecipient = (message1: Message, message2: Message): boolean => {
  if (message1 === undefined || message2 === undefined) {
    return false;
  }

  if (message1.type !== message2.type) {
    return false;
  }

  switch (message1.type) {
    case 'private':
      return (
        normalizeRecipients(message1.display_recipient).toLowerCase() ===
        normalizeRecipients(message2.display_recipient).toLowerCase()
      );
    case 'stream':
      return (
        message1.display_recipient.toLowerCase() === message2.display_recipient.toLowerCase() &&
        message1.subject.toLowerCase() === message2.subject.toLowerCase()
      );
    case 'outbox': {
      return message2.isOutbox;
    }
    default:
      // Invariant
      return false;
  }
};

export const isTopicMuted = (stream: string, topic: string, mute: string[] = []): boolean =>
  mute.some(x => x[0] === stream && x[1] === topic);

export const shouldBeMuted = (
  message: Message,
  narrow: Narrow,
  subscriptions: Subscription[] = [],
  mutes: MuteState = [],
): boolean => {
  if (typeof message.display_recipient !== 'string') {
    return false; // private/group messages are not muted
  }

  if (narrow.length === 0) {
    const sub = subscriptions.find(x => x.name === message.display_recipient);
    if (!sub || !sub.in_home_view) {
      return true;
    }
  }

  return mutes.some(x => x[0] === message.display_recipient && x[1] === message.subject);
};

export const isMessageRead = (
  message: Message,
  subscriptions: Subscription[],
  mute: MuteState,
): boolean =>
  shouldBeMuted(message, homeNarrow, subscriptions, mute) ||
  (typeof message.flags === 'undefined' ? false : message.flags.indexOf('read') > -1);

export const findFirstUnread = (
  messages: Message[],
  subscriptions: Subscription[],
  mute: MuteState,
) => messages.find(msg => !isMessageRead(msg, subscriptions, mute));

export const findAnchor = (messages: Message[], subscriptions: Subscription[], mute: MuteState) => {
  const firstUnreadMessage = findFirstUnread(messages, subscriptions, mute);
  return firstUnreadMessage ? firstUnreadMessage.id : 0;
};
