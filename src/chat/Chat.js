import React from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import { OfflineNotice } from '../common';
import { canSendToNarrow } from '../utils/narrow';
import { filterUnreadMessageIds, countUnread } from '../utils/unread';
import { registerAppActivity } from '../utils/activity';
import { queueMarkAsRead } from '../api';
import MessageList from '../message/MessageList';
import MessageListLoading from '../message/MessageListLoading';
import NoMessages from '../message/NoMessages';
import ComposeBox from '../compose/ComposeBox';
import UnreadNotice from './UnreadNotice';
import EmojiPicker from '../emoji/EmojiPicker';

export default class Chat extends React.Component {

  static contextTypes = {
    styles: () => null,
  };

  scrollOffset = 0;

  handleMessageListScroll = e => {
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

  render() {
    const { styles } = this.context;
    const { messages, narrow, fetching, isOnline, readIds } = this.props;
    const noMessages = messages.length === 0 && !(fetching.older || fetching.newer);
    const noMessagesButLoading = messages.length === 0 && (fetching.older || fetching.newer);
    const showMessageList = !noMessages && !noMessagesButLoading;
    const unreadCount = countUnread(messages.map(msg => msg.id), readIds);
    const WrapperView = Platform.OS === 'ios' ? KeyboardAvoidingView : View;

    return (
      <WrapperView style={styles.screen} behavior="padding">
        <UnreadNotice
          unreadCount={unreadCount}
          scrollOffset={this.scrollOffset}
          shouldOffsetForInput={canSendToNarrow(narrow)}
        />
        {!isOnline && <OfflineNotice />}
        {noMessages && <NoMessages narrow={narrow} />}
        {noMessagesButLoading && <MessageListLoading />}
        {showMessageList &&
        <ActionSheetProvider>
          <MessageList onScroll={this.handleMessageListScroll} {...this.props} />
        </ActionSheetProvider>}
        {canSendToNarrow(narrow) && <ComposeBox />}
        <EmojiPicker />
      </WrapperView>
    );
  }
  }
