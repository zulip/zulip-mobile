import { Message } from '../types';

export const filterUnreadMessageIds = (messageIds: number[], flags: Object): Message[] =>
  messageIds.filter(msgId => !flags || !flags.read || !flags.read[msgId]);
