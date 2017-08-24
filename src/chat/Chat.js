/* @flow */
import React, { PureComponent } from 'react';
import { View, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import type { Narrow } from '../types';
import { OfflineNotice } from '../common';
import { canSendToNarrow } from '../utils/narrow';
import MessageListContainer from '../message/MessageListContainer';
// import MessageList from '../message/MessageListWeb';
// import MessageList from '../message/MessageListFlatList';
import MessageListLoading from '../message/MessageListLoading';
import NoMessages from '../message/NoMessages';
import ComposeBoxContainer from '../compose/ComposeBoxContainer';
// import UnreadNotice from './UnreadNotice';
import NotSubscribed from '../message/NotSubscribed';

export default class Chat extends PureComponent {
  messageInputRef = null;
  messageInputRef: TextInput;

  static contextTypes = {
    styles: () => null,
  };

  scrollOffset: number = 0;
  listComponent: Object;

  props: {
    narrow: Narrow,
    isFetching: boolean,
    isOnline: boolean,
    isSubscribed: boolean,
    noMessages: boolean,
  };

  handleSend = () => {
    if (this.listComponent && this.listComponent.scrollToEnd !== undefined) {
      setTimeout(this.listComponent.scrollToEnd, 300);
    }
  };

  onReplySelect = () => {
    // set a timeout because it's take time to render ComposeBox after narrowing from home
    if (this.messageInputRef) setTimeout(() => this.messageInputRef.focus(), 300);
  };

  render() {
    const { styles } = this.context;
    const { isFetching, narrow, isOnline, isSubscribed, noMessages } = this.props;
    const WrapperView = Platform.OS === 'ios' ? KeyboardAvoidingView : View;
    const CheckSub = isSubscribed
      ? <ComposeBoxContainer
          messageInputRef={component => {
            this.messageInputRef = component || this.messageInputRef;
          }}
          onSend={this.handleSend}
        />
      : <NotSubscribed />;

    return (
      <WrapperView style={styles.screen} behavior="padding">
        <ActionSheetProvider>
          <View style={styles.screen}>
            {!isOnline && <OfflineNotice />}
            {noMessages && !isFetching && <NoMessages narrow={narrow} />}
            {noMessages && isFetching && <MessageListLoading />}
            {!noMessages &&
              <ActionSheetProvider>
                <MessageListContainer
                  onReplySelect={this.onReplySelect}
                  listRef={component => {
                    this.listComponent = component || this.listComponent;
                  }}
                />
              </ActionSheetProvider>}
            {/* <UnreadNotice
              unreadCount={unreadCount}
              scrollOffset={this.scrollOffset}
              shouldOffsetForInput={canSendToNarrow(narrow)}
            /> */}
            {canSendToNarrow(narrow) ? CheckSub : null}
          </View>
        </ActionSheetProvider>
      </WrapperView>
    );
  }
}
