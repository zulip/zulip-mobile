/* @flow */
import React, { PureComponent } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  BackAndroid as DeprecatedBackAndroid, // eslint-disable-line
  BackHandler,
} from 'react-native';
import { connect } from 'react-redux';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import type { Auth, Narrow, Message, Action } from '../types';
import { OfflineNotice } from '../common';
import boundActions from '../boundActions';
import {
  getAuth,
  getActiveNarrow,
  getIsFetching,
  getCurrentTypingUsers,
  getShownMessagesInActiveNarrow,
} from '../selectors';
import { getIsActiveStreamSubscribed } from '../subscriptions/subscriptionSelectors';
import { canSendToNarrow } from '../utils/narrow';
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

class Chat extends PureComponent {
  static contextTypes = {
    styles: () => null,
  };

  scrollOffset: number = 0;
  backPressListener: () => ?boolean;

  props: {
    auth: Auth,
    narrow: Narrow,
    isFetching: boolean,
    isOnline: boolean,
    isSubscribed: boolean,
    flags: Object,
    messages: Message[],
    readIds: Object,
    actions: Action,
  };

  componentWillMount() {
    const BackAndroid = BackHandler || DeprecatedBackAndroid;
    if (Platform.OS === 'android') {
      this.backPressListener = BackAndroid.addEventListener('backPress', this.onBackPressed);
    }
  }

  onBackPressed = () => {
    const { actions, narrow } = this.props;
    if (narrow.length > 0) {
      actions.popNarrow();
      return true; // will not exit, just go back
    }
    return false;
  };

  componentWillUnmount() {
    if (Platform.OS === 'android') {
      this.backPressListener.remove();
    }
  }

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
    const { isFetching, messages, narrow, isOnline, readIds, isSubscribed } = this.props;
    const noMessages = messages.length === 0;
    const unreadCount = countUnread(messages.map(msg => msg.id), readIds);
    const WrapperView = Platform.OS === 'ios' ? KeyboardAvoidingView : View;
    const CheckSub = isSubscribed ? <ComposeBox /> : <NotSubscribed />;

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
    isFetching: getIsFetching(state),
    narrow: getActiveNarrow(state),
    mute: state.mute,
    messages: getShownMessagesInActiveNarrow(state),
    typingUsers: getCurrentTypingUsers(state),
    users: state.users,
    readIds: state.flags.read,
    twentyFourHourTime: state.realm.twentyFourHourTime,
    isSubscribed: getIsActiveStreamSubscribed(state),
  }),
  boundActions,
)(Chat);
