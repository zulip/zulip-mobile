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

class ZulipStreamView extends React.Component {
  componentDidMount() {
    // We use setTimeout with time=0 to force this to happen in the next
    // iteration of the event loop. This ensures that the last action ends
    // before the new action begins and makes the debug output clearer.
    setTimeout(() => this.props.getLatestMessages(this.props.auth), 0);
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

const mapStateToProps = (state) => ({
  auth: state.auth,
  messages: state.stream.messages,
  fetching: state.stream.fetching,
});

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators({
    getLatestMessages,
  }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ZulipStreamView);
