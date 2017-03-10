import React from 'react';
import { StyleSheet } from 'react-native';
import TaggedView from '../native/TaggedView';

import { unreadMessageFilter } from '../utils/unread';
import { registerAppActivity } from '../utils/activity';
import { LoadingIndicator } from '../common';
import InfiniteScrollView from './InfiniteScrollView';
import renderMessages from './renderMessages';

const styles = StyleSheet.create({
  list: {
    backgroundColor: 'white',
  },
});

export default class MessageList extends React.PureComponent {

  autoScrollToBottom = false;

  componentWillReceiveProps(nextProps) {
    this.autoScrollToBottom = this.props.caughtUp.newer && nextProps.caughtUp.newer;
  }

  onScroll = e => {
    const { auth, messages, markAsRead } = this.props;

    if (!markAsRead || !e.visibleIds) {
      return;
    }

    const visibleMessages = e.visibleIds.map((messageId) =>
      messages.find(msg => msg.id === +messageId)
    );
    const unreadMessages = visibleMessages.filter(unreadMessageFilter);
    markAsRead(unreadMessages);
    registerAppActivity(auth);
  };

  render() {
    const { caughtUp, fetching, fetchOlder, fetchNewer, hideFetchingOlder } = this.props;
    const messageList = renderMessages(this.props);

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
            collapsable={false}
          >
            {elem}
          </TaggedView>
        );
      }
    }

    return (
      <InfiniteScrollView
        style={styles.list}
        automaticallyAdjustContentInset="false"
        stickyHeaderIndices={headerIndices}
        onStartReached={fetchOlder}
        onEndReached={fetchNewer}
        autoScrollToBottom={this.autoScrollToBottom}
        onScroll={this.onScroll}
      >
        {hideFetchingOlder &&
          <LoadingIndicator active={fetching.older} caughtUp={caughtUp.older} />}
        {messageList}
        {fetching.newer && <LoadingIndicator active />}
      </InfiniteScrollView>
    );
  }
}
