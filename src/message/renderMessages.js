/* @flow */
import React from 'react';

import type { Narrow } from '../types';
import {
  isTopicNarrow,
  isPrivateOrGroupNarrow,
  extractTypeToAndSubjectFromNarrow,
} from '../utils/narrow';
import MessageHeaderContainer from '../message/headers/MessageHeaderContainer';
import MessageContainer from '../message/MessageContainer';
import OutboxMessageContainer from '../message/OutboxMessageContainer';
import TimeRow from '../message/TimeRow';
import { isSameRecipient } from '../utils/message';
import { isSameDay } from '../utils/date';

type Props = {
  messages: any[],
  narrow: Narrow,
};

export default ({ messages, narrow }: Props) => {
  const list: Object[] = [];
  let prevItem;

  for (const item of messages) {
    const isOutbox = !item.id;
    const diffDays =
      prevItem && !isSameDay(new Date(prevItem.timestamp * 1000), new Date(item.timestamp * 1000));
    if (!prevItem || diffDays) {
      list.push(
        <TimeRow type="time_row" key={`time${item.timestamp}`} timestamp={item.timestamp} />,
      );
    }

    const showHeader = !isPrivateOrGroupNarrow(narrow) && !isTopicNarrow(narrow);
    const diffRecipient = !isSameRecipient(prevItem, item);
    const extractedOutboxData = isOutbox ? extractTypeToAndSubjectFromNarrow(item.narrow) : {};
    if (showHeader && diffRecipient) {
      list.push(
        <MessageHeaderContainer
          type="header"
          key={`header${item.id}`}
          message={
            isOutbox
              ? {
                  ...item,
                  display_recipient: extractedOutboxData[1],
                  subject: extractedOutboxData[2],
                }
              : item
          }
          narrow={narrow}
        />,
      );
    }
    const shouldGroupWithPrev =
      !diffRecipient &&
      !diffDays &&
      prevItem &&
      prevItem.sender_full_name === item.sender_full_name;

    if (isOutbox) {
      list.push(
        <OutboxMessageContainer
          type="outbox"
          key={item.timestamp}
          isBrief={shouldGroupWithPrev}
          message={item}
          narrow={narrow}
        />,
      );
      prevItem = item;
      continue; // eslint-disable-line
    }

    list.push(
      <MessageContainer
        type="message"
        key={item.id}
        isBrief={shouldGroupWithPrev}
        message={item}
        narrow={narrow}
      />,
    );

    prevItem = item;
  }
  return list;
};
