/* @flow strict-local */
import type { Message, Narrow, Outbox, HtmlPieceDescriptor } from '../types';
import { isTopicNarrow, isPmNarrow } from '../utils/narrow';
import { isSameRecipient } from '../utils/recipient';
import { isSameDay } from '../utils/date';

export default (
  messages: $ReadOnlyArray<Message | Outbox>,
  narrow: Narrow,
): $ReadOnlyArray<HtmlPieceDescriptor> => {
  const showHeader = !isPmNarrow(narrow) && !isTopicNarrow(narrow);

  let prevMessage = undefined;
  const pieces: HtmlPieceDescriptor[] = [];
  messages.forEach(message => {
    const diffDays =
      !!prevMessage
      && !isSameDay(new Date(prevMessage.timestamp * 1000), new Date(message.timestamp * 1000));
    if (!prevMessage || diffDays) {
      const renderedTimeDescriptor = {
        key: `time${message.timestamp}`,
        type: 'time',
        timestamp: message.timestamp,
        subsequentMessage: message,
      };
      pieces.push(renderedTimeDescriptor);
    }

    const diffRecipient = !isSameRecipient(prevMessage, message);
    if (showHeader && diffRecipient) {
      pieces.push({
        type: 'header',
        key: `header${message.id}`,
        subsequentMessage: message,
      });
    }

    const shouldGroupWithPrev =
      !diffRecipient && !diffDays && !!prevMessage && prevMessage.sender_id === message.sender_id;

    const renderedMessageDescriptor = {
      key: message.id,
      type: 'message',
      isBrief: shouldGroupWithPrev,
      message,
    };
    pieces.push(renderedMessageDescriptor);

    prevMessage = message;
  });
  return pieces;
};
