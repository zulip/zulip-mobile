/* @flow strict-local */
import type { Narrow, Message, MuteState, Outbox, Subscription } from '../types';
import { isTopicNarrow } from './narrow';
import { streamNameOfStreamMessage } from './recipient';

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

  const streamName = streamNameOfStreamMessage(message);

  if (narrow.length === 0) {
    const sub = subscriptions.find(x => x.name === streamName);
    if (!sub || !sub.in_home_view) {
      return true;
    }
  }

  return mutes.some(x => x[0] === streamName && x[1] === message.subject);
};
