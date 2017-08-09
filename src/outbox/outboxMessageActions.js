/* @flow */
import { sendMessage as sendMessageApi } from '../api';
import type { OutboxSendMessage } from '../types';

export const trySendMessages = ({ outbox, eventQueueId, auth }: OutboxSendMessage) => {
  if (outbox.length > 0) {
    outbox.forEach(item => {
      sendMessageApi(
        auth,
        item.type,
        item.to,
        item.subject,
        item.content,
        item.localMessageId,
        eventQueueId,
      );
    });
  }
};
