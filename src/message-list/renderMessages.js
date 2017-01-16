import React from 'react';

import { getFullUrl } from '../utils/url';
import {
  isTopicNarrow,
  isPrivateNarrow,
  isGroupNarrow,
} from '../utils/narrow';
import MessageHeader from '../message/headers/MessageHeader';
import MessageContainer from '../message/MessageContainer';
import MessageLoading from '../message/MessageLoading';
import TimeRow from '../message/TimeRow';
import { isSameRecipient } from '../utils/message';
import { isSameDay } from '../utils/date';

export default ({ auth, subscriptions, messages, isFetching, narrow, doNarrow }) => {
  const list = [];
  const headerIndices = [];
  const anchorIndices = [];
  let prevItem;
  let index = 0;

  if (isFetching) {
    for (let i = 0; i < 6; i++) {
      list.push(
        <MessageLoading key={`ml${i}`} />
      );
      index++;
    }
  }

  for (const item of messages) {
    const diffDays = prevItem &&
      !isSameDay(new Date(prevItem.timestamp * 1000), new Date(item.timestamp * 1000));

    if (!prevItem || diffDays) {
      list.push(
        <TimeRow
          key={`time${item.timestamp}`}
          timestamp={item.timestamp}
        />
      );
      index++;
    }

    const showHeader = !isPrivateNarrow(narrow) &&
      !isGroupNarrow(narrow) && !isTopicNarrow(narrow);
    const diffRecipient = !isSameRecipient(prevItem, item);

    if (showHeader && diffRecipient) {
      headerIndices.push(index);
      list.push(
        <MessageHeader
          key={`header${item.id}`}
          item={item}
          auth={auth}
          subscriptions={subscriptions}
          narrow={narrow}
          doNarrow={doNarrow}
        />
      );
      index++;
    }

    const shouldGroupWithPrev = !diffRecipient && !diffDays &&
      prevItem && prevItem.sender_full_name === item.sender_full_name;

    anchorIndices.push(index);
    list.push(
      <MessageContainer
        key={item.id}
        auth={auth}
        isBrief={shouldGroupWithPrev}
        fromName={item.sender_full_name}
        fromEmail={item.sender_email}
        message={item.content}
        timestamp={item.timestamp}
        avatarUrl={getFullUrl(item.avatar_url, auth.realm)}
      />
    );
    index++;

    prevItem = item;
  }

  return {
    messageList: list,
    headerIndices,
    anchorIndices,
  };
};
