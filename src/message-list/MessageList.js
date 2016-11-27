import React from 'react';
import { StyleSheet } from 'react-native';

import InfiniteScrollView from './InfiniteScrollView';
import MessageHeader from '../message/headers/MessageHeader';
import MessageContainer from '../message/MessageContainer';
import TimeRow from '../message/TimeRow';
import { sameRecipient, rewriteLink } from '../utils/message';
import { isSameDay } from '../utils/date';
import { getAuthHeader } from '../api/apiFetch';

const styles = StyleSheet.create({
  list: {
    backgroundColor: 'white',
  },
});

export default class MessageList extends React.PureComponent {

  populateStream(items) {
    const { auth, messages, subscriptions, narrow } = this.props;

    const headerIndices = [];
    const context = {
      rewriteLink: (uri) => rewriteLink(
        uri,
        auth.realm,
        getAuthHeader(auth.email, auth.apiKey),
      ),
    };
    let prevItem;
    let totalIdx = 0;
    for (const item of messages) {
      const diffRecipient = !sameRecipient(prevItem, item);
      const diffDays = prevItem &&
        !isSameDay(new Date(prevItem.timestamp * 1000), new Date(item.timestamp * 1000));
      const shouldGroupWithPrev = !diffRecipient && !diffDays &&
        prevItem && prevItem.sender_full_name === item.sender_full_name;

      if (diffDays) {
        items.push(
          <TimeRow
            key={`time${item.timestamp}`}
            timestamp={item.timestamp}
          />
        );
        totalIdx++;
      }

      if (diffRecipient) {
        items.push(
          <MessageHeader
            key={`header${item.id}`}
            item={item}
            auth={auth}
            subscriptions={subscriptions}
            narrow={narrow}
          />
        );
        headerIndices.push(totalIdx);
        totalIdx++;
      }

      items.push(
        <MessageContainer
          key={item.id}
          isBrief={shouldGroupWithPrev}
          from={item.sender_full_name}
          message={item.content}
          timestamp={item.timestamp}
          twentyFourHourTime={this.props.twentyFourHourTime}
          avatarUrl={item.avatar_url}
          context={context}
        />
      );
      totalIdx++;
      prevItem = item;
    }
    return headerIndices;
  }

  render() {
    const { caughtUp, fetchOlder, fetchNewer } = this.props;
    const stream = [];
    const headerIndices = this.populateStream(stream);
    return (
      <InfiniteScrollView
        style={styles.list}
        automaticallyAdjustContentInset="false"
        autoScrollToBottom={caughtUp}
        stickyHeaderIndices={headerIndices}
        onStartReached={fetchOlder}
        onEndReached={fetchNewer}
      >
        {stream}
      </InfiniteScrollView>
    );
  }
}
