/* @flow strict-local */
import type { Message, Narrow, Outbox, PieceDescriptor } from '../types';
import { isTopicNarrow, isPrivateOrGroupNarrow } from '../utils/narrow';
import { isSameRecipient } from '../utils/recipient';
import { isSameDay } from '../utils/date';

export default (messages: $ReadOnlyArray<Message | Outbox>, narrow: Narrow): PieceDescriptor[] => {
  const showHeader = !isPrivateOrGroupNarrow(narrow) && !isTopicNarrow(narrow);

  let prevMessage;
  const sections = [{ key: 0, data: [], message: {} }];
  messages.forEach(message => {
    const diffDays =
      prevMessage
      && !isSameDay(new Date(prevMessage.timestamp * 1000), new Date(message.timestamp * 1000));
    if (!prevMessage || diffDays) {
      sections[sections.length - 1].data.push({
        key: `time${message.timestamp}`,
        type: 'time',
        timestamp: message.timestamp,
        subsequentMessage: message,
      });
    }
    const diffRecipient = !isSameRecipient(prevMessage, message);
    if (showHeader && diffRecipient) {
      sections.push({
        key: `header${message.id}`,
        message,
        data: [],
      });
    }
    const shouldGroupWithPrev =
      !diffRecipient
      && !diffDays
      && prevMessage
      && prevMessage.sender_full_name === message.sender_full_name;

    sections[sections.length - 1].data.push({
      key: message.id,
      type: 'message',
      isBrief: shouldGroupWithPrev,
      message,
    });

    prevMessage = message;
  });
  return sections;
};
