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

export default ({ auth, subscriptions, messages, isFetching, narrow, doNarrow }) =>
  messages.reduce((list, item, index) => {
    const prevItem = messages[index - 1];

    const diffDays = prevItem &&
      !isSameDay(new Date(prevItem.timestamp * 1000), new Date(item.timestamp * 1000));

    if (index === 0 || diffDays) {
      list.push(
        <TimeRow
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

    return list;
  }, isFetching ? [<MessageLoading key="ml1" />, <MessageLoading key="ml2" />, <MessageLoading key="ml3" />] : []);
