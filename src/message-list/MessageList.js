import React from 'react';
import { StyleSheet } from 'react-native';

import InfiniteScrollView from './InfiniteScrollView';
import MessageHeader from '../message/headers/MessageHeader';
import MessageContainer from '../message/MessageContainer';
import {
  sameRecipient,
  rewriteLink,
} from '../utils/message';
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
      if (!sameRecipient(prevItem, item)) {
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
