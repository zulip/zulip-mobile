import React from 'react';

import { getFullUrl } from '../utils/url';
import MessageHeader from '../message/headers/MessageHeader';
import MessageContainer from '../message/MessageContainer';
import TimeRow from '../message/TimeRow';
import { sameRecipient } from '../utils/message';
import { isSameDay } from '../utils/date';

export default ({ auth, subscriptions, messages, narrow }) =>
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

    const diffRecipient = !sameRecipient(prevItem, item);

    if (diffRecipient) {
      list.push(
        <MessageHeader
          key={`header${item.id}`}
          item={item}
          auth={auth}
          subscriptions={subscriptions}
          narrow={narrow}
        />
      );
    }

    const shouldGroupWithPrev = !diffRecipient && !diffDays &&
      prevItem && prevItem.sender_full_name === item.sender_full_name;

    list.push(
      <MessageContainer
        key={item.id}
        isBrief={shouldGroupWithPrev}
        from={item.sender_full_name}
        message={item.content}
        timestamp={item.timestamp}
        avatarUrl={getFullUrl(item.avatar_url, auth.realm)}
      />
    );

    return list;
  }, []);
