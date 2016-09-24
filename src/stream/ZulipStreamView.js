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

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

// Actions
import {
  getMessages,
} from './streamActions';

import {
  getEvents,
} from '../events/eventActions';

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#fff',
  },
});

class ZulipStreamView extends React.Component {
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  componentDidMount() {
    this.props.getEvents(this.props.account);

    // We use requestAnimationFrame to force this to happen in the next
    // iteration of the event loop. This ensures that the last action ends
    // before the new action begins and makes the debug output clearer.
    requestAnimationFrame(() =>
      this.props.getMessages(
        this.props.account,
        Number.MAX_SAFE_INTEGER,
        10,
        10,
        this.props.narrow
      )
    );
  }

  fetchOlder() {
    if (!this.props.fetching) {
      this.props.getMessages(
        this.props.account,
        this.props.pointer[0],
        10,
        0,
        this.props.narrow,
      );
    }
  }

  fetchNewer() {
    if (!this.props.fetching && !this.props.caughtUp) {
      this.props.getMessages(
        this.props.account,
        this.props.pointer[1],
        0,
        10,
        this.props.narrow,
      );
    }
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
        />
      );
    } else if (item.type === 'private') {
      return (
        <ZulipPrivateMessageHeader
          key={`section_${item.id}`}
          recipients={item.display_recipient.filter(r =>
            r.email !== this.props.account.email
          ).map(r => r.full_name)}
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
        onStartReached={this.fetchOlder.bind(this)}
        onEndReached={this.fetchNewer.bind(this)}
      >
        {stream}
      </InfiniteScrollView>
    );
  }
}

const mapStateToProps = (state) => ({
  account: state.user.accounts.get(state.user.activeAccountId),
  messages: state.stream.messages,
  fetching: state.stream.fetching,
  narrow: state.stream.narrow,
  subscriptions: state.realm.subscriptions,
  pointer: state.stream.pointer,
  caughtUp: state.stream.caughtUp,
});

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators({
    getMessages,
    getEvents,
  }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ZulipStreamView);
