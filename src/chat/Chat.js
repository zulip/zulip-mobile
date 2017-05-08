import React from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import styles from '../styles';
import { OfflineNotice } from '../common';
import { canSendToNarrow, isStreamNarrow, isTopicNarrow } from '../utils/narrow';
import { filterUnreadMessageIds, countUnread } from '../utils/unread';
import { registerAppActivity } from '../utils/activity';
import { queueMarkAsRead, subscriptionAdd } from '../api';
import MessageList from '../message/MessageList';
import MessageListLoading from '../message/MessageListLoading';
import ComposeBox from '../compose/ComposeBox';
import UnreadNotice from './UnreadNotice';
import ShowNotice from '../message/ShowNotice';
import NotSubscribed from './NotSubscribed';

export default class Chat extends React.Component {
  scrollOffset = 0;

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

    // Calculates the amount user has scrolled up from the very bottom
    this.scrollOffset = e.contentSize.height - e.contentOffset.y - e.layoutMeasurement.height;

    registerAppActivity(auth);
  };

  subscribeStream = () => {
    const { narrow } = this.props;
    if (isStreamNarrow(narrow) || isTopicNarrow(narrow)) {
      subscriptionAdd(this.props.auth, [{ name: narrow[0].operand }]);
    }
  };

  render() {
    const { messages, narrow, fetching, isOnline, readIds, subscriptions, streams } = this.props;
    const noMessages = messages.length === 0 && !(fetching.older || fetching.newer);
    const noMessagesButLoading = messages.length === 0 && (fetching.older || fetching.newer);
    const showMessageList = !noMessages && !noMessagesButLoading;
    const unreadCount = countUnread(messages.map(msg => msg.id), readIds);
    const WrapperView = Platform.OS === 'ios' ? KeyboardAvoidingView : View;

    const notSubscribed = (isStreamNarrow(narrow) || isTopicNarrow(narrow)) &&
      subscriptions.find(x => x.name === narrow[0].operand) === undefined;
    const currentStream = (isStreamNarrow(narrow) || isTopicNarrow(narrow)) &&
      streams.find(x => x.name === narrow[0].operand);

    return (
      <WrapperView style={styles.screen} behavior="padding">
        {<UnreadNotice
          unreadCount={unreadCount}
          scrollOffset={this.scrollOffset}
          shouldOffsetForInput={canSendToNarrow(narrow)}
        />}
        {!isOnline && <OfflineNotice />}
        {noMessages &&
          <ShowNotice
            subscribeStream={this.subscribeStream}
            narrow={narrow}
            notSubscribed={notSubscribed}
            showSubscribeButton={currentStream && !currentStream.invite_only}
          />}
        {noMessagesButLoading && <MessageListLoading />}
        {showMessageList &&
        <ActionSheetProvider>
          <MessageList onScroll={this.handleMessageListScroll} {...this.props} />
        </ActionSheetProvider>}
        {!noMessages && notSubscribed &&
          <NotSubscribed
            showSubscribeButton={currentStream && !currentStream.invite_only}
            subscribeStream={this.subscribeStream}
          />}
        {!notSubscribed && canSendToNarrow(narrow) && <ComposeBox />}
      </WrapperView>
    );
  }
  }
