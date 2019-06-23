/* @flow strict-local */
import type { FlagsState, Narrow, Message, MuteState, Outbox, Subscription } from '../types';
import { HOME_NARROW, isTopicNarrow } from './narrow';

export const isTopicMuted = (stream: string, topic: string, mute: MuteState = []): boolean =>
  mute.some(x => x[0] === stream && x[1] === topic);

export const shouldBeMuted = (
  message: Message | Outbox,
  narrow: Narrow,
  subscriptions: Subscription[] = [],
  mutes: MuteState = [],
): boolean => {
  if (message.type === 'private') {
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
  message: Message | Outbox,
  flags: FlagsState,
  subscriptions: Subscription[],
  mute: MuteState,
): boolean => shouldBeMuted(message, HOME_NARROW, subscriptions, mute) || !!flags.read[message.id];

export const findFirstUnread = (
  messages: $ReadOnlyArray<Message | Outbox>,
  flags: FlagsState,
  subscriptions: Subscription[],
  mute: MuteState,
) => messages.find(msg => !isMessageRead(msg, flags, subscriptions, mute));

export const findAnchor = (
  messages: $ReadOnlyArray<Message | Outbox>,
  flags: FlagsState,
  subscriptions: Subscription[],
  mute: MuteState,
) => {
  const firstUnreadMessage = findFirstUnread(messages, flags, subscriptions, mute);
  return firstUnreadMessage ? firstUnreadMessage.id : 0;
};

export const getLinkToMessage = (realm: string, message: Message): string => {
  let conversationPath;
  if (message.type === 'stream') {
    conversationPath = `stream/${message.stream_id}-${message.display_recipient}/topic/${
      message.subject
    }`;
  } else {
    conversationPath = `pm-with/${message.display_recipient.map(recipient => recipient.id).join()}${
      message.display_recipient.length >= 3 ? '-group' : '-pm'
    }`;
  }
  return encodeURI(`${realm}/#narrow/${conversationPath}/near/${message.id}`);
};
