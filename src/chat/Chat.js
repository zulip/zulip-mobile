/* @flow */
import React from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { connect } from 'react-redux';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import type { Auth, Narrow, Message, Fetching } from '../types';
import { OfflineNotice } from '../common';
import boundActions from '../boundActions';
import { getCurrentTypingUsers, getShownMessagesInActiveNarrow } from '../chat/chatSelectors';
import { getAuth } from '../account/accountSelectors';
import { canSendToNarrow, isStreamOrTopicNarrow } from '../utils/narrow';
import { filterUnreadMessageIds, countUnread } from '../utils/unread';
import { registerAppActivity } from '../utils/activity';
import { queueMarkAsRead } from '../api';
import MessageList from '../message/MessageList';
// import MessageList from '../message/MessageListWeb';
// import MessageList from '../message/MessageListFlatList';
import MessageListLoading from '../message/MessageListLoading';
import NoMessages from '../message/NoMessages';
import ComposeBox from '../compose/ComposeBox';
import UnreadNotice from './UnreadNotice';
import NotSubscribed from '../message/NotSubscribed';

class Chat extends React.Component {
  static contextTypes = {
    styles: () => null,
  };

  scrollOffset: number = 0;

  props: {
    auth: Auth,
    narrow: Narrow,
    fetching: Fetching,
    needsInitialFetch: boolean,
    isOnline: boolean,
    flags: Object,
    messages: Message[],
    readIds: Object,
    subscriptions: any[],
  };

  handleMessageListScroll = (e: Object) => {
    const { auth, flags } = this.props;
    const visibleMessageIds = e.visibleIds.map(x => +x);
    const unreadMessageIds = filterUnreadMessageIds(visibleMessageIds, flags);

    if (unreadMessageIds.length > 0) {
      queueMarkAsRead(auth, unreadMessageIds);
    }

    // Calculates the amount user has scrolled up from the very bottom
    this.scrollOffset = e.contentSize.height - e.contentOffset.y - e.layoutMeasurement.height;

    registerAppActivity(auth);
  };

  isSubscribed = () => {
    const { narrow, subscriptions } = this.props;
    return isStreamOrTopicNarrow(narrow)
      ? subscriptions.find(sub => narrow[0].operand === sub.name) !== undefined
      : true;
  };

  render() {
    const { styles } = this.context;
    const { messages, narrow, fetching, isOnline, readIds, needsInitialFetch } = this.props;
    const isFetching = needsInitialFetch || fetching.older || fetching.newer;
    const noMessages = messages.length === 0;
    const unreadCount = countUnread(messages.map(msg => msg.id), readIds);
    const WrapperView = Platform.OS === 'ios' ? KeyboardAvoidingView : View;
    const CheckSub = this.isSubscribed() ? <ComposeBox /> : <NotSubscribed />;

    return (
      <WrapperView style={styles.screen} behavior="padding">
        <UnreadNotice
          unreadCount={unreadCount}
          scrollOffset={this.scrollOffset}
          shouldOffsetForInput={canSendToNarrow(narrow)}
        />
        {!isOnline && <OfflineNotice />}
        {noMessages && !isFetching && <NoMessages narrow={narrow} />}
        {noMessages && isFetching && <MessageListLoading />}
        {!noMessages &&
          <ActionSheetProvider>
            <MessageList onScroll={this.handleMessageListScroll} {...this.props} />
          </ActionSheetProvider>}
        {canSendToNarrow(narrow) ? CheckSub : null}
      </WrapperView>
    );
  }
}

export default connect(
  state => ({
    auth: getAuth(state),
    isOnline: state.app.isOnline,
    subscriptions: state.subscriptions,
    flags: state.flags,
    needsInitialFetch: state.app.needsInitialFetch,
    fetching: state.chat.fetching,
    caughtUp: state.chat.caughtUp,
    narrow: state.chat.narrow,
    mute: state.mute,
    messages: getShownMessagesInActiveNarrow(state),
    typingUsers: getCurrentTypingUsers(state),
    users: state.users,
    readIds: state.flags.read,
    twentyFourHourTime: state.realm.twentyFourHourTime,
  }),
  boundActions,
)(Chat);
