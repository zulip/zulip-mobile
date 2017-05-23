import React from 'react';
import { KeyboardAvoidingView } from 'react-native';

import styles from '../styles';
import { OfflineNotice } from '../common';
import { canSendToNarrow, isNarrowWithComposeBox } from '../utils/narrow';
import { filterUnreadMessageIds, countUnread } from '../utils/unread';
import { registerAppActivity } from '../utils/activity';
import { queueMarkAsRead } from '../api';
import MessageList from '../message/MessageList';
import MessageListLoading from '../message/MessageListLoading';
import NoMessages from '../message/NoMessages';
import ComposeBox from '../compose/ComposeBox';
import UnreadNotice from './UnreadNotice';


export default class Chat extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      scrollOffset: 0
    };
  }

  handleMessageListScroll = e => {
    if (!e.visibleIds) {
      return; // temporary fix for Android
    }

    const { auth, flags, markMessagesRead } = this.props;
    const visibleMessageIds = e.visibleIds.map(x => +x);
    const unreadMessageIds = filterUnreadMessageIds(visibleMessageIds, flags);

    if (markMessagesRead && unreadMessageIds.length > 0) {
      markMessagesRead(unreadMessageIds);
      queueMarkAsRead(auth, unreadMessageIds);
    }

    this.setState({
      // Calculating the amount user has scrolled up from the bottom
      scrollOffset: e.contentSize.height - e.contentOffset.y - e.layoutMeasurement.height
    });

    registerAppActivity(auth);
  };

  render() {
    const { messages, narrow, fetching, isOnline, readIds } = this.props;
    const noMessages = messages.length === 0 && !(fetching.older || fetching.newer);
    const noMessagesButLoading = messages.length === 0 && (fetching.older || fetching.newer);
    const showMessageList = !noMessages && !noMessagesButLoading;
    const unreadCount = countUnread(messages.map(msg => msg.id), readIds);

    return (
      <KeyboardAvoidingView style={styles.screen} behavior="padding">
        {<UnreadNotice
          count={unreadCount}
          shouldOffsetForInput={isNarrowWithComposeBox(narrow)}
          scrollOffset={this.state.scrollOffset}
        />}
        {!isOnline && <OfflineNotice />}
        {noMessages && <NoMessages narrow={narrow} />}
        {noMessagesButLoading && <MessageListLoading />}
        {showMessageList && <MessageList onScroll={this.handleMessageListScroll} {...this.props} />}
        {canSendToNarrow(narrow) && <ComposeBox />}
      </KeyboardAvoidingView>
    );
  }
}
