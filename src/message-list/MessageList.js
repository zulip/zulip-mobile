import React from 'react';
import { StyleSheet } from 'react-native';
import TaggedView from '../native/TaggedView';

import { registerAppActivity } from '../utils/activity';
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
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      autoScrollToBottom: this.props.caughtUp.newer && nextProps.caughtUp.newer,
    });
  }

  onScroll = (e) => {
    const { auth, messages, markAsRead } = this.props;

    if (!markAsRead || !e.visibleIds) {
      return;
    }

    markAsRead(e.visibleIds.map((messageId) =>
      messages.find((msg) => msg.id.toString() === messageId)
    ).filter((msg) => msg && msg.flags && msg.flags.indexOf('read') === -1));
    registerAppActivity(auth);
  }

  render() {
    const { messages, caughtUp, fetching,
      fetchOlder, fetchNewer, hideFetchingOlder } = this.props;
    let messageList = [];
    let containerStyle = {};

    if (messages.length === 0) {
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
          <TaggedView
            key={elem.props.message.id}
            tagID={elem.props.message.id.toString()}
            collapsable={false}>
            {elem}
          </TaggedView>
        );
      }
    }

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
