import React from 'react';
import {
  StyleSheet,
} from 'react-native';

import InfiniteScrollView from './InfiniteScrollView';

import ZulipStreamMessageHeader from '../message/ZulipStreamMessageHeader';
import ZulipPrivateMessageHeader from '../message/ZulipPrivateMessageHeader';

import ZulipMessageView from '../message/ZulipMessageView';
import { sameRecipient } from '../lib/message';

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#fff',
  },
});

export default class ZulipStreamView extends React.PureComponent {

  getHeader(item) {
    if (item.type === 'stream') {
      const subscription = this.props.subscriptions.get(item.display_recipient);
      return (
        <ZulipStreamMessageHeader
          key={`section_${item.id}`}
          stream={item.display_recipient}
          topic={item.subject}
          color={subscription ? subscription.color : '#ccc'}
          item={item}
          narrow={this.props.narrow}
        />
      );
    } else if (item.type === 'private') {
      return (
        <ZulipPrivateMessageHeader
          key={`section_${item.id}`}
          recipients={item.display_recipient.filter(r =>
            r.email !== this.props.email
          )}
          item={item}
          narrow={this.props.narrow}
        />
      );
    }
    return undefined;
  }

  populateStream(items) {
    const headerIndices = [];
    let prevItem;
    let totalIdx = 0;
    for (const item of this.props.messages) {
      if (!sameRecipient(prevItem, item)) {
        items.push(this.getHeader(item));
        headerIndices.push(totalIdx);
        totalIdx++;
      }
      items.push(
        <ZulipMessageView
          key={item.id}
          from={item.sender_full_name}
          message={item.content}
          timestamp={item.timestamp}
          avatarUrl={item.avatar_url}
        />
      );
      totalIdx++;
      prevItem = item;
    }
    return headerIndices;
  }

  render() {
    const stream = [];
    const headerIndices = this.populateStream(stream);
    return (
      <InfiniteScrollView
        style={styles.scrollView}
        automaticallyAdjustContentInset="false"
        autoScrollToBottom={this.props.caughtUp}
        stickyHeaderIndices={headerIndices}
        onStartReached={this.props.fetchOlder}
        onEndReached={this.props.fetchNewer}
      >
        {stream}
      </InfiniteScrollView>
    );
  }
}
