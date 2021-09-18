/* @flow strict-local */
import type { Message, Narrow, Outbox, HtmlPieceDescriptor } from '../types';
import { isConversationNarrow } from '../utils/narrow';
import { isSameRecipient } from '../utils/recipient';
import { isSameDay } from '../utils/date';

// Prefer getHtmlPieceDescriptorsMemoized.
export default (
  messages: $ReadOnlyArray<Message | Outbox>,
  narrow: Narrow,
): $ReadOnlyArray<HtmlPieceDescriptor> => {
  // A recipient header identifies the conversation the messages after it
  // are in.  We show them unless the narrow already contains that information.
  const canShowRecipientHeaders = !isConversationNarrow(narrow);

  const pieces: HtmlPieceDescriptor[] = [];
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    const prevMessage: typeof message | void = messages[i - 1];

    // We show a date separator at the top, and whenever the day changes.
    const showDateSeparator =
      !prevMessage
      || !isSameDay(new Date(prevMessage.timestamp * 1000), new Date(message.timestamp * 1000));
    if (showDateSeparator) {
      pieces.push({
        key: `time${message.timestamp}`,
        type: 'time',
        timestamp: message.timestamp,
        subsequentMessage: message,
      });
    }

    // If we show recipient headers here at all, we do so at the top and
    // whenever the recipient changes.
    const diffRecipient = !prevMessage || !isSameRecipient(prevMessage, message);
    const showRecipientHeader = canShowRecipientHeaders && diffRecipient;
    if (showRecipientHeader) {
      pieces.push({
        type: 'header',
        key: `header${message.id}`,
        subsequentMessage: message,
      });
    }

    // We show the sender at the top and whenever the sender changes.
    // We also reaffirm the sender whenever we've shown a date separator or
    // recipient header, because our visual design has it bind tighter than
    // either of those.
    const showSender =
      !prevMessage
      || prevMessage.sender_id !== message.sender_id
      || showDateSeparator
      || showRecipientHeader;

    pieces.push({
      key: message.id,
      type: 'message',
      isBrief: !showSender,
      message,
    });
  }
  return pieces;
};
