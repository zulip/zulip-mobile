/* @flow */
import type { Message, Narrow, RenderedSectionDescriptor } from '../types';
import { isTopicNarrow, isPrivateOrGroupNarrow } from '../utils/narrow';
import MessageHeaderContainer from '../message/headers/MessageHeaderContainer';
import MessageContainer from '../message/MessageContainer';
import TimeRow from '../message/TimeRow';
import { isSameRecipient } from '../utils/message';
import { isSameDay } from '../utils/date';

export default (messages: Message[], narrow: Narrow): RenderedSectionDescriptor[] => {
  const sections: RenderedSectionDescriptor[] = [{ key: 0, data: [], message: {} }];
  let prevItem;
  const showHeader = !isPrivateOrGroupNarrow(narrow) && !isTopicNarrow(narrow);

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
