/* @flow */
import React from 'react';

import type { Narrow } from '../types';
import { isTopicNarrow, isPrivateOrGroupNarrow } from '../utils/narrow';
import MessageHeaderContainer from '../message/headers/MessageHeaderContainer';
import MessageContainer from '../message/MessageContainer';
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
    const diffDays =
      prevItem && !isSameDay(new Date(prevItem.timestamp * 1000), new Date(item.timestamp * 1000));

    if (!prevItem || diffDays) {
      list.push(
        <TimeRow type="time_row" key={`time${item.timestamp}`} timestamp={item.timestamp} />,
      );
    }

    const showHeader = !isPrivateOrGroupNarrow(narrow) && !isTopicNarrow(narrow);
    const diffRecipient = !isSameRecipient(prevItem, item);

    if (showHeader && diffRecipient) {
      list.push(
        <MessageHeaderContainer
          type="header"
          key={`header${item.id}`}
          message={item}
          narrow={narrow}
        />,
      );
    }

    const shouldGroupWithPrev =
      !diffRecipient &&
      !diffDays &&
      prevItem &&
      prevItem.sender_full_name === item.sender_full_name;

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
