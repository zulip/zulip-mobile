import { Message } from '../types';

export const filterUnreadMessages = (messages: Message[], flags: Object): Message[] =>
  messages.filter(msg =>
    !flags[msg.id] || !flags[msg.id].includes('read')
  );

export const filterUnreadMessageIds = (messageIds: number[], flags: Object): Message[] =>
  messageIds.filter(msgId =>
    !flags[msgId] || !flags[msgId].includes('read')
  );
