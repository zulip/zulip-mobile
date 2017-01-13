import { specialNarrow } from '../utils/narrow';
import { normalizeRecipients } from '../utils/message';

export const getAllMessages = (state) =>
  state.chat.messages;

export const getMessagesInActiveNarrow = (state) =>
  state.chat.messages[JSON.stringify(state.chat.narrow)] || [];

export const getPointer = (state) => {
  const messages = getMessagesInActiveNarrow(state);

  if (messages.length === 0) {
    return {
      older: Number.MAX_SAFE_INTEGER,
      newer: Number.MAX_SAFE_INTEGER,
    };
  }

  return {
    older: messages[0].id,
    newer: messages[messages.length - 1].id,
  };
};

export const getRecentConversations = (state) => {
  const selfEmail = state.account[0].email;
  const messages = state.chat.messages[JSON.stringify(specialNarrow('private'))] || [];
  const recipientSet = messages.reduce((accumulator, x) => {
    const recipientsSansMe = x.display_recipient.filter(r => r.email !== selfEmail);
    const normalized = normalizeRecipients(recipientsSansMe);
    accumulator.add(normalized);
    return accumulator;
  }, new Set());

  return Array.from(recipientSet);
};
