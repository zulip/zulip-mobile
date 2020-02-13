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
  showMessagePlaceholders: boolean,
|};

type Props = $ReadOnly<{|
  /* $FlowFixMe: probably this shouldn't be optional */
  narrow?: Narrow,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

const componentStyles = StyleSheet.create({
  /** A workaround for #3089, by letting us put MessageList first. */
  reverse: {
    flex: 1,
    flexDirection: 'column-reverse',
  },
});

class Chat extends PureComponent<Props> {
  render() {
    const { showMessagePlaceholders, narrow } = this.props;

    const showComposeBox = canSendToNarrow(narrow) && !showMessagePlaceholders;
    return (
      <KeyboardAvoider style={styles.flexed} behavior="padding">
        <View style={styles.flexed}>
          <View style={componentStyles.reverse}>
            <MessageList narrow={narrow} showMessagePlaceholders={showMessagePlaceholders} />
            <NoMessages narrow={narrow} showMessagePlaceholders={showMessagePlaceholders} />
            <UnreadNotice narrow={narrow} />
          </View>
          {showComposeBox && <ComposeBox narrow={narrow} />}
        </View>
      </KeyboardAvoider>
    );
  }
}

export default connect<SelectorProps, _, _>((state, props) => ({
  showMessagePlaceholders: getShowMessagePlaceholders(props.narrow)(state),
}))(Chat);
