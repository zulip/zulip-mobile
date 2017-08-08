/* @flow */
import React, { PureComponent } from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import type { Auth, Narrow, Message } from '../types';
import { OfflineNotice } from '../common';
import { canSendToNarrow } from '../utils/narrow';
import { filterUnreadMessageIds } from '../utils/unread';
import { registerAppActivity } from '../utils/activity';
import { queueMarkAsRead } from '../api';
import MessageList from '../message/MessageList';
// import MessageList from '../message/MessageListWeb';
// import MessageList from '../message/MessageListFlatList';
import MessageListLoading from '../message/MessageListLoading';
import NoMessages from '../message/NoMessages';
import ComposeBoxContainer from '../compose/ComposeBoxContainer';
// import UnreadNotice from './UnreadNotice';
import NotSubscribed from '../message/NotSubscribed';

export default class Chat extends PureComponent {
  static contextTypes = {
    styles: () => null,
  };

  scrollOffset: number = 0;

  props: {
    auth: Auth,
    narrow: Narrow,
    isFetching: boolean,
    isOnline: boolean,
    isSubscribed: boolean,
    flags: Object,
    messages: Message[],
    // unreadCount: number,
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

  render() {
    const { styles } = this.context;
    const { isFetching, messages, narrow, isOnline, isSubscribed } = this.props;
    const noMessages = messages.length === 0;
    const WrapperView = Platform.OS === 'ios' ? KeyboardAvoidingView : View;
    const CheckSub = isSubscribed ? <ComposeBoxContainer /> : <NotSubscribed />;

    return (
      <WrapperView style={styles.screen} behavior="padding">
        {!isOnline && <OfflineNotice />}
        {noMessages && !isFetching && <NoMessages narrow={narrow} />}
        {noMessages && isFetching && <MessageListLoading />}
        {!noMessages &&
          <ActionSheetProvider>
            <MessageList onScroll={this.handleMessageListScroll} {...this.props} />
          </ActionSheetProvider>}
        {/* <UnreadNotice
          unreadCount={unreadCount}
          scrollOffset={this.scrollOffset}
          shouldOffsetForInput={canSendToNarrow(narrow)}
        /> */}
        {canSendToNarrow(narrow) ? CheckSub : null}
      </WrapperView>
    );
  }
}
