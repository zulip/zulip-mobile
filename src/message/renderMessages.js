/* @flow strict-local */
import type { Message, Narrow, Outbox, RenderedSectionDescriptor } from '../types';
import { isTopicNarrow, isPmNarrow } from '../utils/narrow';
import { isSameRecipient } from '../utils/recipient';
import { isSameDay } from '../utils/date';

export default (
  messages: $ReadOnlyArray<Message | Outbox>,
  narrow: Narrow,
): RenderedSectionDescriptor[] => {
  const showHeader = !isPmNarrow(narrow) && !isTopicNarrow(narrow);

  // eslint-disable-next-line no-undef-init
  let prevItem = undefined;
  const sections = [{ key: 0, data: [], message: {} }];
  messages.forEach(item => {
    const diffDays =
      !!prevItem
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

    // TODO(#3764): Use sender_id, not sender_email.  Needs making
    //   Outbox#sender_id required; which needs a migration to drop Outbox
    //   values that lack it; which is fine once the release that adds it
    //   has been out for a few weeks.
    const shouldGroupWithPrev =
      !diffRecipient && !diffDays && !!prevItem && prevItem.sender_email === item.sender_email;

    sections[sections.length - 1].data.push({
      key: item.id,
      type: 'message',
      isBrief: shouldGroupWithPrev,
      message: item,
    });

    prevItem = item;
  });
  return sections;
};
