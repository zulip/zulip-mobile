import { Message } from '../types';

export const getUnreadMessages = (messages: Message[], flags: Object): Message[] =>
  messages.filter(msg =>
    !flags[msg.id] || !flags[msg.id].includes('read')
  );
