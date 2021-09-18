/* @flow strict-local */
import type { Message, Narrow, Outbox, HtmlPieceDescriptor } from '../types';
import { isTopicNarrow, isPmNarrow } from '../utils/narrow';
import { isSameRecipient } from '../utils/recipient';
import { isSameDay } from '../utils/date';

// Prefer getHtmlPieceDescriptorsMemoized.
export default (
  messages: $ReadOnlyArray<Message | Outbox>,
  narrow: Narrow,
): $ReadOnlyArray<HtmlPieceDescriptor> => {
  const showHeader = !isPmNarrow(narrow) && !isTopicNarrow(narrow);

  const pieces: HtmlPieceDescriptor[] = [];
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    const prevMessage: typeof message | void = messages[i - 1];

    const diffDays =
      !!prevMessage
      && !isSameDay(new Date(prevMessage.timestamp * 1000), new Date(message.timestamp * 1000));
    if (!prevMessage || diffDays) {
      pieces.push({
        key: `time${message.timestamp}`,
        type: 'time',
        timestamp: message.timestamp,
        subsequentMessage: message,
      });
    }

    const diffRecipient = !prevMessage || !isSameRecipient(prevMessage, message);
    if (showHeader && diffRecipient) {
      pieces.push({
        type: 'header',
        key: `header${message.id}`,
        subsequentMessage: message,
      });
    }

    const shouldGroupWithPrev =
      !diffRecipient && !diffDays && !!prevMessage && prevMessage.sender_id === message.sender_id;

    pieces.push({
      key: message.id,
      type: 'message',
      isBrief: shouldGroupWithPrev,
      message,
    });
  }
  return pieces;
};
