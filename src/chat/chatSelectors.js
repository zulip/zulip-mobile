import { specialNarrow } from '../utils/narrow';
import { normalizeRecipients } from '../utils/message';

export const getAllMessages = (state) =>
  state.chat.messages;

export const getMessagesInActiveNarrow = (state) =>
  state.chat.messages[JSON.stringify(state.chat.narrow)] || [];

export const getAnchor = (state) => {
  const messages = getMessagesInActiveNarrow(state);

  if (messages.length === 0) {
    return undefined;
  }

  return {
    older: messages[0].id,
    newer: messages[messages.length - 1].id,
  };
};

export const getRecentConversations = (state) => {
  const selfEmail = state.account[0].email;
  const privateNarrowStr = JSON.stringify(specialNarrow('private'));
  const messages = state.chat.messages[privateNarrowStr] || [];
  const recipients = messages.map(msg =>
    normalizeRecipients(
      msg.display_recipient.length === 1 ?
        msg.display_recipient :
        msg.display_recipient.filter(r => r.email !== selfEmail
    )
  ));
  const uniqueRecipients = Array.from(new Set(recipients));

  return uniqueRecipients;
};
