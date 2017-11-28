/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import type { Narrow } from '../types';
import { KeyboardAvoider, OfflineNotice } from '../common';

import MessageListContainer from '../message/MessageListContainer';
import MessageListLoading from '../message/MessageListLoading';
import NoMessages from '../message/NoMessages';
import ComposeBoxContainer from '../compose/ComposeBoxContainer';
import UnreadNoticeContainer from './UnreadNoticeContainer';

type Props = {
  narrow: Narrow,
  isFetching: boolean,
  isOnline: boolean,
  noMessages: boolean,
};

export default class Chat extends PureComponent<Props> {
  messageInputRef = null;
  messageInputRef: any;

  static contextTypes = {
    styles: () => null,
  };

  scrollOffset: number = 0;
  listComponent: any;

  props: Props;

  handleSend = () => {
    /* setTimeout(() => {
      if (this.listComponent && this.listComponent.scrollToEnd !== undefined) {
        this.listComponent.scrollToEnd();
      }
    }, 300); */
  };

  handleReplySelect = () => {
    // set a timeout because it's take time to render ComposeBox after narrowing from home
    setTimeout(() => {
      if (this.messageInputRef) {
        this.messageInputRef.focus();
      }
    }, 300);
  };

  render() {
    const { styles } = this.context;
    const { isFetching, narrow, isOnline, noMessages } = this.props;
    const showMessagePlaceholders = noMessages && isFetching;

    return (
      <KeyboardAvoider style={styles.flexed} behavior="padding">
        <ActionSheetProvider>
          <View style={styles.flexed}>
            {!isOnline && <OfflineNotice />}
            <UnreadNoticeContainer />
            {noMessages && !isFetching && <NoMessages narrow={narrow} />}
            {showMessagePlaceholders && <MessageListLoading />}
            {!noMessages && (
              <ActionSheetProvider>
                <MessageListContainer
                  onReplySelect={this.handleReplySelect}
                  listRef={component => {
                    this.listComponent = component || this.listComponent;
                  }}
                />
              </ActionSheetProvider>
            )}
            {!showMessagePlaceholders && (
              <ComposeBoxContainer
                messageInputRef={(component: any) => {
                  this.messageInputRef = component || this.messageInputRef;
                }}
                onSend={this.handleSend}
              />
            )}
          </View>
        </ActionSheetProvider>
      </KeyboardAvoider>
    );
  }
}
