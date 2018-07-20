/* @flow */
import type { Message, Narrow, RenderedSection } from '../types';
import { NULL_MESSAGE } from '../nullObjects';
import { isTopicNarrow, isPrivateOrGroupNarrow } from '../utils/narrow';
import { isSameRecipient } from '../utils/message';
import { isSameDay } from '../utils/date';

export default (messages: Message[], narrow: Narrow): RenderedSection[] => {
  let prevItem;
  const showHeader = !isPrivateOrGroupNarrow(narrow) && !isTopicNarrow(narrow);

  return messages.reduce(
    (sections, item) => {
      const diffDays =
        prevItem
        && !isSameDay(new Date(prevItem.timestamp * 1000), new Date(item.timestamp * 1000));
      if (!prevItem || diffDays) {
        sections[sections.length - 1].data.push({
          key: `time${item.timestamp}`,
          type: 'time',
          timestamp: item.timestamp,
          firstMessage: item,
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
        !diffRecipient
        && !diffDays
        && prevItem
        && prevItem.sender_full_name === item.sender_full_name;

      sections[sections.length - 1].data.push({
        key: item.id,
        type: 'message',
        isBrief: shouldGroupWithPrev,
        message: item,
      });

      prevItem = item;

      return sections;
    },
    [{ key: 0, data: [], message: NULL_MESSAGE }],
  );
};
