import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
} from 'react-native';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import InfiniteScrollView from './InfiniteScrollView';

import {
  ZulipStreamMessageHeader,
  ZulipPrivateMessageHeader,
} from '../message/ZulipMessageGroupView';

import ZulipMessageView from '../message/ZulipMessageView';
import { sameRecipient } from '../lib/message.js';

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#fff',
  },
});

export default class ZulipStreamView extends React.Component {
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  getHeader(item) {
    if (item.type === 'stream') {
      const subscription = this.props.subscriptions.get(item.display_recipient);
      return (
        <ZulipStreamMessageHeader
          key={`section_${item.id}`}
          stream={item.display_recipient}
          topic={item.subject}
          color={subscription ? subscription.color : "#ccc"}
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
  }

  populateStream(items) {
    let headerIndices = [];
    let prevItem = undefined;
    let totalIdx = 0;
    for (let item of this.props.messages) {
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
    let stream = [];
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
