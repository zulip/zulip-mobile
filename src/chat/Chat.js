/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import { KeyboardAvoider, OfflineNotice } from '../common';
import MessageListContainer from '../message/MessageListContainer';
import NoMessages from '../message/NoMessages';
import ComposeBoxContainer from '../compose/ComposeBoxContainer';
import UnreadNotice from './UnreadNotice';

export default class Chat extends PureComponent<{}> {
  messageInputRef = null;
  messageInputRef: any;

  static contextTypes = {
    styles: () => null,
  };

  scrollOffset: number = 0;
  listComponent: any;

  handleReplySelect = () => {
    if (this.messageInputRef) {
      try {
        this.messageInputRef.focus();
      } catch (e) {
        // do not crash if component is mounted
      }
    }
  };

  render() {
    const { styles } = this.context;

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
            <ComposeBoxContainer
              messageInputRef={(component: any) => {
                this.messageInputRef = component || this.messageInputRef;
              }}
            />
          </View>
        </ActionSheetProvider>
      </KeyboardAvoider>
    );
  }
}
