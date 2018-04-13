/* @flow */
import React, { PureComponent } from 'react';
import { ScrollView, View } from 'react-native';

import type { Narrow } from '../types';
import { KeyboardAvoider, OfflineNotice } from '../common';
import MessageListContainer from '../message/MessageListContainer';
import NoMessages from '../message/NoMessages';
import ComposeBoxContainer from '../compose/ComposeBoxContainer';
import UnreadNotice from './UnreadNotice';

type Props = {
  narrow?: Narrow,
};

export default class Chat extends PureComponent<Props> {
  props: Props;
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
    const { narrow } = this.props;

    return (
      <KeyboardAvoider style={styles.flexed} behavior="padding">
        <OfflineNotice />
        <UnreadNotice narrow={narrow} />
        <NoMessages narrow={narrow} />
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.flexed}
          keyboardShouldPersistTaps="always"
          overScrollMode="never"
        >
          <View style={styles.flexed}>
            <MessageListContainer
              narrow={narrow}
              onReplySelect={this.handleReplySelect}
              listRef={component => {
                this.listComponent = component || this.listComponent;
              }}
            />
          </View>
          <ComposeBoxContainer
            narrow={narrow}
            messageInputRef={(component: any) => {
              this.messageInputRef = component || this.messageInputRef;
            }}
          />
        </ScrollView>
      </KeyboardAvoider>
    );
  }
}
