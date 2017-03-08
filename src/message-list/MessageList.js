import React from 'react';
import { StyleSheet, View } from 'react-native';
import TaggedView from '../native/TaggedView';

import { registerAppActivity } from '../utils/activity';
import { LoadingIndicator } from '../common';
import { isHomeNarrow } from '../utils/narrow';
import MessageLoading from '../message/MessageLoading';
import InfiniteScrollView from './InfiniteScrollView';
import renderMessages from './renderMessages';
import InfoLabel from '../common/InfoLabel';
import { NEW_MSG_INFO_SCROLL_THRESHOLD } from '../constants';

const styles = StyleSheet.create({
  list: {
    backgroundColor: 'white',
  },
  centerContainer: {
    flexGrow: 1,
    justifyContent: 'space-around',
  },
  container: {
    flex: 1
  },
});

export default class MessageList extends React.PureComponent {
  constructor() {
    super();
    this.state = {
      shouldShowNewMessageIndicator: false,
      autoScrollToBottom: false,
    };

    // Variables concerned with calculating scroll position
    this.initialContentHeight = 0;
    this.initialScrollOffset = 0;
  }

  componentWillReceiveProps(nextProps) {
    // New messages have been received and user has scrolled above the threshold value
    if (this.hasScrolledBeyondInfoThreshold() && this.didReceiveNewMessages(nextProps)) {
      this.setState({
        shouldShowNewMessageIndicator: true
      });
    } else {
      this.setState({
        shouldShowNewMessageIndicator: false
      });
    }

    this.setState({
      autoScrollToBottom: this.props.caughtUp.newer && nextProps.caughtUp.newer,
    });
  }

  onScroll = (e) => {
    const { auth, messages, markAsRead } = this.props;

    if (!this.initialScrollOffset || this.scrollOffset < 0) {
      this.initialScrollOffset = e.contentOffset.y;
      this.initialContentHeight = e.contentSize.height;
    }

    this.scrollOffset = this.initialScrollOffset - e.contentOffset.y;

     // When view has been scrolled to bottom hide new message indicator
    if (this.scrollOffset <= 0) {
      this.setState({
        shouldShowNewMessageIndicator: false
      });
    }

    if (!markAsRead) {
      return;
    }

    markAsRead(e.visibleIds.map((messageId) =>
      messages.find((msg) => msg.id.toString() === messageId)
    ).filter((msg) => msg && msg.flags && msg.flags.indexOf('read') === -1));
    registerAppActivity(auth);
  }

  // Checks if the current scroll position is beyond threshold scroll position
  // for showing new messages indicator
  hasScrolledBeyondInfoThreshold() {
    return this.scrollOffset > NEW_MSG_INFO_SCROLL_THRESHOLD;
  }

  // Checks if new messages have been received
  didReceiveNewMessages(props) {
    return props.messages.length > this.props.messages.length;
  }

  // Returns InfoLabel Component defined in '../common/InfoLabel.js'
  renderNewMessagesIndicator() {
    const { narrow } = this.props;
    if (this.state.shouldShowNewMessageIndicator && isHomeNarrow(narrow)) {
      return <InfoLabel text="New Unread Messages" />;
    } else {
      return null;
    }
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
          />
        );
      }
    }

    // `headerIndices` tell the scroll view which components are headers
    // and are eligible to be docked at the top of the view.
    const headerIndices = [];
    for (let i = 0; i < messageList.length; i++) {
      const elem = messageList[i];
      if (elem.props.type === 'header') {
        headerIndices.push(i);
      }
      if (elem.props.type === 'message') {
        messageList[i] = (
          <TaggedView key={elem.props.message.id} tagID={elem.props.message.id.toString()}>
            {elem}
          </TaggedView>
        );
      }
    }

    return (
      <View style={styles.container}>
        {this.renderNewMessagesIndicator()}
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
      </View>
    );
  }
}
