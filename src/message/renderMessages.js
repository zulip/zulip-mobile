/* @flow */
import type { Message, Narrow } from '../types';
import { isTopicNarrow, isPrivateOrGroupNarrow } from '../utils/narrow';
import { isSameRecipient } from '../utils/message';
import { isSameDay } from '../utils/date';

type TimeDescriptor = {
  type: 'time',
  timestamp: number,
};

type MessageDescriptor = {
  type: 'message',
  message: Object,
};

type ItemDescriptor = MessageDescriptor | TimeDescriptor;

type SectionDescriptor = {
  message: Object,
  data: ItemDescriptor[],
};

export default (messages: Message[], narrow: Narrow) => {
  const sections: SectionDescriptor[] = [{ key: 0, data: [] }];
  let prevItem;

  for (const item of messages) {
    const diffDays =
      prevItem && !isSameDay(new Date(prevItem.timestamp * 1000), new Date(item.timestamp * 1000));
    if (!prevItem || diffDays) {
      sections[sections.length - 1].data.push({
        key: `time${item.timestamp}`,
        type: 'time',
        timestamp: item.timestamp,
      });
    }

    const showHeader = !isPrivateOrGroupNarrow(narrow) && !isTopicNarrow(narrow);
    const diffRecipient = !isSameRecipient(prevItem, item);
    if (showHeader && diffRecipient) {
      sections.push({
        key: `header${item.id}`,
        message: item,
        data: [],
      });
    }
    const shouldGroupWithPrev =
      !diffRecipient &&
      !diffDays &&
      prevItem &&
      prevItem.sender_full_name === item.sender_full_name;

    sections[sections.length - 1].data.push({
      key: item.id,
      type: 'message',
      isBrief: shouldGroupWithPrev,
      message: item,
    });

    prevItem = item;
  }

  return sections;
};
