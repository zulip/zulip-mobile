/* @flow strict-local */
import type { Narrow, Message, MuteState, Outbox, Subscription } from '../types';
import { isHomeNarrow, isTopicNarrow, isMentionedNarrow } from './narrow';
import { streamNameOfStreamMessage } from './recipient';

export const isTopicMuted = (stream: string, topic: string, mute: MuteState = []): boolean =>
  mute.some(x => x[0] === stream && x[1] === topic);

export const shouldBeMuted = (
  message: Message | Outbox,
  narrow: Narrow,
  subscriptions: $ReadOnlyArray<Subscription> = [],
  mutes: MuteState = [],
): boolean => {
  if (message.type === 'private') {
    return false; // private/group messages are not muted
  }

  if (isTopicNarrow(narrow)) {
    return false; // never hide a message when narrowed to topic
  }

  // This logic isn't quite right - we want to make sure we never hide a
  // message that has a mention, even if we aren't in the "Mentioned"
  // narrow. (#3472)  However, it's more complex to do that, and this code
  // fixes the largest problem we'd had with muted mentioned messages, which
  // is that they show up in the count for the "Mentions" tab, but without
  // this conditional they wouldn't in the actual narrow.
  if (isMentionedNarrow(narrow)) {
    return false;
  }

  const streamName = streamNameOfStreamMessage(message);

  if (isHomeNarrow(narrow)) {
    const sub = subscriptions.find(x => x.name === streamName);
    if (!sub) {
      // If there's no matching subscription, then the user must have
      // unsubscribed from the stream since the message was received.  Leave
      // those messages out of this view, just like for a muted stream.
      return true;
    }
    if (!sub.in_home_view) {
      return true;
    }
  }

  return mutes.some(x => x[0] === streamName && x[1] === message.subject);
};
