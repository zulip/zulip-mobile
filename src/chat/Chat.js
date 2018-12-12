/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Context, Narrow } from '../types';
import { KeyboardAvoider } from '../common';
import MessageList from '../webview/MessageList';
import NoMessages from '../message/NoMessages';
import ComposeBox from '../compose/ComposeBox';
import UnreadNotice from './UnreadNotice';

type Props = {|
  /* $FlowFixMe: probably this shouldn't be optional */
  narrow?: Narrow,
|};

export default class Chat extends PureComponent<Props> {
  context: Context;

  static contextTypes = {
    styles: () => null,
  };

  scrollOffset: number = 0;

  render() {
    const { styles } = this.context;
    const { narrow } = this.props;

    return (
      <KeyboardAvoider style={styles.flexed} behavior="padding">
        <View style={styles.flexed}>
          <UnreadNotice narrow={narrow} />
          <NoMessages narrow={narrow} />
          <MessageList narrow={narrow} />
          <ComposeBox narrow={narrow} />
        </View>
      </KeyboardAvoider>
    );
  }
}
