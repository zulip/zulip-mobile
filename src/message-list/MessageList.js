import React from 'react';
import { StyleSheet, View } from 'react-native';

import { LoadingIndicator } from '../common';
import MessageLoading from '../message/MessageLoading';

import InfiniteScrollView from './InfiniteScrollView';
import renderMessages from './renderMessages';

const styles = StyleSheet.create({
  list: {
    backgroundColor: 'white',
  },
  centerContainer: {
    flexGrow: 1,
    justifyContent: 'space-around',
  },
});

export default class MessageList extends React.PureComponent {
  constructor() {
    super();
    this.state = {
      autoScrollToBottom: false,
    };

    // We need to make sure we're using the right version of react native
    // Otherwise, scroll behavior will be subtly broken
    /* eslint-disable */
    if (__DEV__) {
      if (!View.propTypes.hasOwnProperty('assocID')) {
        console.error(
          'RCTView does not have custom extensions to support' +
          ' anchored scrolling. Are you using the zulip/react-native fork?'
        );
      }
    }
    /* eslint-enable */
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      autoScrollToBottom: this.props.caughtUp.newer && nextProps.caughtUp.newer,
    });
  }

  onScroll = (e) => {
    const { messages, markAsRead } = this.props;
    const visibleIds = e.visibleIds;

    markAsRead(visibleIds.map((messageId) =>
      messages.find((msg) => msg.id.toString() === messageId)
    ).filter((msg) => msg && msg.flags && msg.flags.indexOf('read') === -1));
  }

  render() {
    const { messages, subscriptions, caughtUp, fetching,
      fetchOlder, fetchNewer, hideFetchingOlder } = this.props;
    let messageList = [];
    let containerStyle = {};

    if (messages.length === 0 || subscriptions.length === 0) {
      if (!caughtUp.older || !caughtUp.newer) {
        // Show placeholder messages if we're loading the screen
        messageList = [...Array(6).keys()].map((i) =>
          <MessageLoading key={`ml${i}`} />
        );
      }
      containerStyle = styles.centerContainer;
    } else {
      if (!hideFetchingOlder) {
        messageList.push(
          <LoadingIndicator
            key={'top_loading'}
            active={fetching.older}
            caughtUp={caughtUp.older}
          />);
      }

      messageList.push(...renderMessages(this.props));

      if (fetching.newer) {
        messageList.push(
          <LoadingIndicator
            key={'bottom_loading'}
            active
          />);
      }
    }

    // `headerIndices` tell the scroll view which components are headers
    // and are eligible to be docked at the top of the view.
    const headerIndices = [];
    messageList.forEach((elem, idx) => {
      if (elem.props.type === 'header') {
        headerIndices.push(idx);
      }
    });

    return (
      <InfiniteScrollView
        style={styles.list}
        contentContainerStyle={containerStyle}
        automaticallyAdjustContentInset="false"
        stickyHeaderIndices={headerIndices}
        onStartReached={fetchOlder}
        onEndReached={fetchNewer}
        autoScrollToBottom={this.state.autoScrollToBottom}
        onScroll={this.onScroll}
      >
        {messageList}
      </InfiniteScrollView>
    );
  }
}
