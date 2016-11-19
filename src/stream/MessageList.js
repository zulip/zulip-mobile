import React from 'react';
import {
  StyleSheet,
} from 'react-native';

import InfiniteScrollView from './InfiniteScrollView';
import StreamMessageHeader from '../message/headers/StreamMessageHeader';
import PrivateMessageHeader from '../message/headers/PrivateMessageHeader';
import MessageView from '../message/MessageView';
import {
  sameRecipient,
  rewriteLink,
} from '../utils/message';
import { getAuthHeader } from '../api/apiFetch';

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#fff',
  },
});

export default class MessageList extends React.PureComponent {

  getHeader(item) {
    if (item.type === 'stream') {
      const subscription = this.props.subscriptions.find(x => x.get('name') === item.display_recipient);
      return (
        <StreamMessageHeader
          key={`section_${item.id}`}
          isPrivate={item.invite_only}
          stream={item.display_recipient}
          topic={item.subject}
          color={subscription ? subscription.get('color') : '#ccc'}
          item={item}
          narrow={this.props.narrow}
        />
      );
    } else if (item.type === 'private') {
      return (
        <PrivateMessageHeader
          key={`section_${item.id}`}
          recipients={item.display_recipient.filter(r =>
            r.email !== this.props.auth.get('email')
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
    const context = {
      rewriteLink: (uri) => rewriteLink(
        uri,
        this.props.auth.get('realm'),
        getAuthHeader(this.props.auth.get('email'), this.props.auth.get('apiKey')),
      ),
    };
    let prevItem;
    let totalIdx = 0;
    for (const item of this.props.messages) {
      if (!sameRecipient(prevItem, item)) {
        items.push(this.getHeader(item));
        headerIndices.push(totalIdx);
        totalIdx++;
      }
      items.push(
        <MessageView
          key={item.id}
          from={item.sender_full_name}
          message={item.content}
          timestamp={item.timestamp}
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
