/* @flow */
import type { FlagsState, Recipient, Narrow, Message, MuteState, Subscription } from '../types';
import { homeNarrow, isTopicNarrow } from './narrow';

// TODO types: this union is confusing
export const normalizeRecipients = (recipients: { email: string }[] | string) =>
  !Array.isArray(recipients)
    ? recipients
    : recipients
        .map(s => s.email.trim())
        .filter(x => x.length > 0)
        .sort()
        .join(',');

export const normalizeRecipientsSansMe = (recipients: { email: string }[], ownEmail: string) =>
  recipients.length === 1
    ? recipients[0].email
    : normalizeRecipients(recipients.filter(r => r.email !== ownEmail));

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

export const isTopicMuted = (stream: string, topic: string, mute: MuteState = []): boolean =>
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

  if (isTopicNarrow(narrow)) {
    return false; // never hide a message when narrowed to topic
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
  flags: FlagsState,
  subscriptions: Subscription[],
  mute: MuteState,
): boolean => shouldBeMuted(message, homeNarrow, subscriptions, mute) || !!flags.read[message.id];

export const findFirstUnread = (
  messages: Message[],
  flags: FlagsState,
  subscriptions: Subscription[],
  mute: MuteState,
) => messages.find(msg => !isMessageRead(msg, flags, subscriptions, mute));

export const findAnchor = (
  messages: Message[],
  flags: FlagsState,
  subscriptions: Subscription[],
  mute: MuteState,
) => {
  const firstUnreadMessage = findFirstUnread(messages, flags, subscriptions, mute);
  return firstUnreadMessage ? firstUnreadMessage.id : 0;
};
