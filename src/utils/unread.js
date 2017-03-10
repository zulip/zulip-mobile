import { Message } from '../types';

export const unreadMessageFilter = (message: Message): boolean =>
  !message || !message.flags || !message.flags.includes('read');

export const getUnreadMessageCount = (messages: Message[]): number =>
  messages.filter(unreadMessageFilter).length;
