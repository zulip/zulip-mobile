/* @flow */
import React from 'react';

import type { Actions, Auth, Narrow } from '../types';
import { isTopicNarrow, isPrivateOrGroupNarrow } from '../utils/narrow';
import MessageHeader from '../message/headers/MessageHeader';
import MessageContainer from '../message/MessageContainer';
import TimeRow from '../message/TimeRow';
import { isSameRecipient } from '../utils/message';
import { isSameDay } from '../utils/date';

type Props = {
  auth: Auth,
  actions: Actions,
  subscriptions: any[],
  users: Object[],
  messages: any[],
  mute: boolean,
  flags: Object,
  narrow: Narrow,
  onLongPress: (message: Object) => void,
  onHeaderLongPress: (item: Object) => void,
  twentyFourHourTime: boolean,
};

export default ({
  auth,
  actions,
  subscriptions,
  users,
  messages,
  narrow,
  mute,
  onLongPress,
  onHeaderLongPress,
  flags,
  twentyFourHourTime,
}: Props) => {
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
        <MessageHeader
          type="header"
          key={`header${item.id}`}
          item={item}
          auth={auth}
          actions={actions}
          subscriptions={subscriptions}
          narrow={narrow}
          onHeaderLongPress={onHeaderLongPress}
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
        auth={auth}
        actions={actions}
        message={item}
        isBrief={shouldGroupWithPrev}
        avatarUrl={item.avatar_url}
        users={users}
        onLongPress={onLongPress}
        flags={flags}
        twentyFourHourTime={twentyFourHourTime}
      />,
    );

    prevItem = item;
  }
  return list;
};
