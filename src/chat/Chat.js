/* @flow */
import React, { PureComponent } from 'react';
import { TextInput, View } from 'react-native';

import type { Context, Narrow } from '../types';
import { KeyboardAvoider } from '../common';
import MessageList from '../message/MessageList';
import NoMessages from '../message/NoMessages';
import ComposeBox from '../compose/ComposeBox';
import UnreadNotice from './UnreadNotice';

type Props = {
  /* $FlowFixMe: probably this shouldn't be optional */
  narrow?: Narrow,
};

export default class Chat extends PureComponent<Props> {
  context: Context;
  props: Props;
  messageInputRef: ?TextInput = null;

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
