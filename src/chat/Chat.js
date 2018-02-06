/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import type { Message, Narrow } from '../types';
import { KeyboardAvoider, OfflineNotice } from '../common';

import MessageListContainer from '../message/MessageListContainer';
import NoMessages from '../message/NoMessages';
import ComposeBoxContainer from '../compose/ComposeBoxContainer';
import UnreadNotice from './UnreadNotice';

type Props = {
  narrow: Narrow,
  showMessagePlaceholders: boolean,
  isOnline: boolean,
  noMessages: boolean,
  lastMessage: Message,
  ownEmail: string,
};

type State = {
  invalidateFlag: boolean,
};

export default class Chat extends PureComponent<Props, State> {
  messageInputRef: any = null;
  shouldFocusComposeBox: boolean = false;
  state = {
    invalidateFlag: false,
  };

  static contextTypes = {
    styles: () => null,
  };

  scrollOffset: number = 0;
  listComponent: any;

  props: Props;

  componentDidUpdate(prevProps: Props) {
    const { noMessages, lastMessage, ownEmail } = this.props;

    if (!this.listComponent || noMessages || lastMessage.id === prevProps.lastMessage.id) {
      return;
    }

    if (lastMessage.sender_email === ownEmail && this.listComponent) {
      this.listComponent.scrollToEnd();
    }

    this.shouldFocusComposeBox = false;
  }

  handleReplySelect = () => {
    this.shouldFocusComposeBox = true;
    this.setState({
      invalidateFlag: !this.state.invalidateFlag,
    });
  };

  render() {
    const { styles } = this.context;
    const { showMessagePlaceholders } = this.props;

    return (
      <KeyboardAvoider style={styles.flexed} behavior="padding">
        <ActionSheetProvider>
          <View style={styles.flexed}>
            <OfflineNotice />
            <UnreadNotice />
            <NoMessages />
            <ActionSheetProvider>
              <MessageListContainer
                onReplySelect={this.handleReplySelect}
                listRef={component => {
                  this.listComponent = component || this.listComponent;
                }}
              />
            </ActionSheetProvider>
            {!showMessagePlaceholders && (
              <ComposeBoxContainer shouldFocus={this.shouldFocusComposeBox} />
            )}
          </View>
        </ActionSheetProvider>
      </KeyboardAvoider>
    );
  }
}
