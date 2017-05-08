import React from 'react';

import {
  isTopicNarrow,
  isPrivateNarrow,
  isGroupNarrow,
} from '../utils/narrow';

import MessageHeader from '../message/headers/MessageHeader';
import MessageContainer from '../message/MessageContainer';
import TimeRow from '../message/TimeRow';
import { isSameRecipient } from '../utils/message';
import { isSameDay } from '../utils/date';

export default ({ auth, subscriptions, users, messages, narrow, mute, doNarrow, onLongPress }) => {
  const list = [];
  let prevItem;

  for (const item of messages) {
    const diffDays = prevItem &&
      !isSameDay(new Date(prevItem.timestamp * 1000), new Date(item.timestamp * 1000));

    if (!prevItem || diffDays) {
      list.push(
        <TimeRow
          type="time_row"
          key={`time${item.timestamp}`}
          timestamp={item.timestamp}
        />
      );
    }

    const showHeader = !isPrivateNarrow(narrow) &&
      !isGroupNarrow(narrow) && !isTopicNarrow(narrow);
    const diffRecipient = !isSameRecipient(prevItem, item);

    if (showHeader && diffRecipient) {
      list.push(
        <MessageHeader
          type="header"
          key={`header${item.id}`}
          item={item}
          auth={auth}
          subscriptions={subscriptions}
          narrow={narrow}
          doNarrow={doNarrow}
        />
      );
    }

    const shouldGroupWithPrev = !diffRecipient && !diffDays &&
      prevItem && prevItem.sender_full_name === item.sender_full_name;

    list.push(
      <MessageContainer
        type="message"
        key={item.id}
        auth={auth}
        message={item}
        isBrief={shouldGroupWithPrev}
        doNarrow={doNarrow}
        avatarUrl={item.avatar_url}
        users={users}
        onLongPress={onLongPress}
      />
    );

    prevItem = item;
  }
  return list;
};
