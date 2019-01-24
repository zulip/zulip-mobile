/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';

import type { Narrow, Dispatch } from '../types';
import { connect } from '../react-redux';
import { KeyboardAvoider } from '../common';
import MessageList from '../webview/MessageList';
import NoMessages from '../message/NoMessages';
import ComposeBox from '../compose/ComposeBox';
import UnreadNotice from './UnreadNotice';
import styles from '../styles';
import { canSendToNarrow } from '../utils/narrow';
import { getShowMessagePlaceholders } from '../selectors';

type SelectorProps = {|
  canSend: boolean,
|};

type Props = {|
  /* $FlowFixMe: probably this shouldn't be optional */
  narrow?: Narrow,

  dispatch: Dispatch,
  ...SelectorProps,
|};

const componentStyles = StyleSheet.create({
  /** A workaround for #3089, by letting us put MessageList first. */
  reverse: {
    flex: 1,
    flexDirection: 'column-reverse',
  },
});

class Chat extends PureComponent<Props> {
  render() {
    const { canSend, narrow } = this.props;

    return (
      <KeyboardAvoider style={styles.flexed} behavior="padding">
        <View style={styles.flexed}>
          <View style={componentStyles.reverse}>
            <MessageList narrow={narrow} />
            <NoMessages narrow={narrow} />
            <UnreadNotice narrow={narrow} />
          </View>
          {canSend && <ComposeBox narrow={narrow} />}
        </View>
      </KeyboardAvoider>
    );
  }
}

export default connect((state, props): SelectorProps => ({
  canSend: canSendToNarrow(props.narrow) && !getShowMessagePlaceholders(props.narrow)(state),
}))(Chat);
