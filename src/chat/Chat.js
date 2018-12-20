/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';

import type { Context, EditMessage, Narrow, Message } from '../types';
import { KeyboardAvoider } from '../common';
import MessageList from '../webview/MessageList';
import NoMessages from '../message/NoMessages';
import ComposeBox from '../compose/ComposeBox';
import UnreadNotice from './UnreadNotice';

type Props = {|
  editMessage: ?EditMessage,
  onEditMessageSelect: (editMessage: Message) => Promise<void>,
  cancelEditMode: () => void,
  /* $FlowFixMe: probably this shouldn't be optional */
  narrow?: Narrow,
|};

const componentStyles = StyleSheet.create({
  /** A workaround for #3089, by letting us put MessageList first. */
  reverse: {
    flex: 1,
    flexDirection: 'column-reverse',
  },
});

export default class Chat extends PureComponent<Props> {
  context: Context;

  static contextTypes = {
    styles: () => null,
  };

  scrollOffset: number = 0;

  render() {
    const { styles } = this.context;
    const { cancelEditMode, editMessage, narrow, onEditMessageSelect } = this.props;

    return (
      <KeyboardAvoider style={styles.flexed} behavior="padding">
        <View style={styles.flexed}>
          <View style={componentStyles.reverse}>
            <MessageList narrow={narrow} onEditMessageSelect={onEditMessageSelect} />
            <NoMessages narrow={narrow} />
            <UnreadNotice narrow={narrow} />
          </View>
          <ComposeBox narrow={narrow} editMessage={editMessage} cancelEditMode={cancelEditMode} />
        </View>
      </KeyboardAvoider>
    );
  }
}
