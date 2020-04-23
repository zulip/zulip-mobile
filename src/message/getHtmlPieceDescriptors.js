/* @flow strict-local */
import type { Message, Narrow, Outbox, PieceDescriptor } from '../types';
import { isTopicNarrow, isPrivateOrGroupNarrow } from '../utils/narrow';
import { isSameRecipient } from '../utils/recipient';
import { isSameDay } from '../utils/date';

export default (messages: $ReadOnlyArray<Message | Outbox>, narrow: Narrow): PieceDescriptor[] => {
  const showHeader = !isPrivateOrGroupNarrow(narrow) && !isTopicNarrow(narrow);

  const pieces = [];

  // src/webview/generateEditSequenceEvent depends on these being in a
  // particular order. The order we're using is 'time', 'header', 'message'.
  messages.forEach((message, i) => {
    const prevMessage = messages[i - 1];
    const diffDays =
      prevMessage !== undefined
      && !isSameDay(new Date(prevMessage.timestamp * 1000), new Date(message.timestamp * 1000));
    const diffRecipient = !isSameRecipient(prevMessage, message);
    const shouldGroupWithPrev =
      !diffRecipient
      && !diffDays
      && prevMessage
      && prevMessage.sender_full_name === message.sender_full_name;

    if (prevMessage === undefined || diffDays) {
      pieces.push({
        key: `time${message.timestamp}`,
        type: 'time',
        timestamp: message.timestamp,
        subsequentMessage: message,
      });
    }
    if (showHeader && diffRecipient) {
      pieces.push({
        key: `header${message.id}`,
        type: 'header',
        subsequentMessage: message,
      });
    }

    pieces.push({
      key: message.id,
      type: 'message',
      isBrief: shouldGroupWithPrev,
      message,
    });
  });
  return pieces;
};
