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

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

// Actions
import {
  getMessages,
} from './streamActions';

const styles = StyleSheet.create({
  scrollView: {
  },
});

class ZulipStreamView extends React.Component {
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  componentDidMount() {
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

  renderStream() {
    let items = [];
    let headerIndices = [];
    let prevItem = undefined;
    let totalIdx = 0;
    for (let item of this.props.messages) {
      if (item.type === 'stream') {
        items.push(
          <ZulipStreamMessageHeader
            key={`section_${item.id}`}
            stream={item.display_recipient}
            topic={item.subject}
            color="#ccc"
          />
        );
      } else if (item.type === 'private') {
        items.push(
          <ZulipPrivateMessageHeader
            key={`section_${item.id}`}
            recipients={item.display_recipient.filter(r =>
              r.email !== this.props.account.email
            ).map(r => r.full_name)}
          />
        );
      }
      headerIndices.push(totalIdx);
      totalIdx++;
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
    return items;
  }

  render() {
    return (
      <InfiniteScrollView
        style={styles.scrollView}
        automaticallyAdjustContentInset="false"
        onStartReached={this.fetchOlder.bind(this)}
        onEndReached={this.fetchNewer.bind(this)}
      >
        {this.renderStream()}
      </InfiniteScrollView>
    );
  }
}

const mapStateToProps = (state) => ({
  account: state.user.accounts.get(state.user.activeAccountId),
  messages: state.stream.messages,
  fetching: state.stream.fetching,
  narrow: state.stream.narrow,
  pointer: state.stream.pointer,
  caughtUp: state.stream.caughtUp,
});

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators({
    getMessages,
  }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ZulipStreamView);
