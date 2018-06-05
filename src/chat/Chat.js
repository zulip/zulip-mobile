/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Context, Narrow } from '../types';
import { KeyboardAvoider, OfflineNotice } from '../common';
import MessageList from '../message/MessageList';
import NoMessages from '../message/NoMessages';
import ComposeBox from '../compose/ComposeBox';
import UnreadNotice from './UnreadNotice';

type Props = {
  narrow?: Narrow,
};

export default class Chat extends PureComponent<Props> {
  context: Context;
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
        <View style={styles.flexed}>
          <OfflineNotice />
          <UnreadNotice narrow={narrow} />
          <NoMessages narrow={narrow} />
          <MessageList
            narrow={narrow}
            onReplySelect={this.handleReplySelect}
            listRef={component => {
              this.listComponent = component || this.listComponent;
            }}
          />
          <ComposeBox
            /* $FlowFixMe: our own props type should probably require `narrow` */
            narrow={narrow}
            messageInputRef={(component: any) => {
              this.messageInputRef = component || this.messageInputRef;
            }}
          />
        </View>
      </KeyboardAvoider>
    );
  }
}
