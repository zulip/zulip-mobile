/* @flow strict-local */
import type { FlagsState, Message, Outbox } from '../types';

export const filterUnreadMessageIds = (
  messageIds: $ReadOnlyArray<number>,
  flags: FlagsState,
): number[] => messageIds.filter((msgId: number) => !flags || !flags.read || !flags.read[msgId]);

export const filterUnreadMessagesInRange = (
  messages: $ReadOnlyArray<Message | Outbox>,
  flags: FlagsState,
  fromId: number,
  toId: number,
): number[] => {
  const messagesInRange = messages
    .filter(msg => !msg.isOutbox)
    .filter(msg => msg.id >= fromId && msg.id <= toId);
  return filterUnreadMessageIds(
    messagesInRange.map(x => x.id),
    flags,
  );
};
