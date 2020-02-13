/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';

import type { Fetching, Narrow, Dispatch } from '../types';
import { connect } from '../react-redux';
import { KeyboardAvoider } from '../common';
import MessageList from '../webview/MessageList';
import NoMessages from '../message/NoMessages';
import ComposeBox from '../compose/ComposeBox';
import UnreadNotice from './UnreadNotice';
import styles from '../styles';
import { canSendToNarrow } from '../utils/narrow';
import { getFetchingForNarrow } from './fetchingSelectors';
import { getShownMessagesForNarrow } from './narrowsSelectors';

type SelectorProps = {|
  fetching: Fetching,
  haveNoMessages: boolean,
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
    const { fetching, haveNoMessages, narrow } = this.props;

    const isFetching = fetching.older || fetching.newer;
    const showMessagePlaceholders = haveNoMessages && isFetching;
    const sayNoMessages = haveNoMessages && !isFetching;
    const showComposeBox = canSendToNarrow(narrow) && !showMessagePlaceholders;
    return (
      <KeyboardAvoider style={styles.flexed} behavior="padding">
        <View style={styles.flexed}>
          <View style={componentStyles.reverse}>
            <MessageList narrow={narrow} showMessagePlaceholders={showMessagePlaceholders} />
            {sayNoMessages && <NoMessages narrow={narrow} />}
            <UnreadNotice narrow={narrow} />
          </View>
          {showComposeBox && <ComposeBox narrow={narrow} />}
        </View>
      </KeyboardAvoider>
    );
  }
}

export default connect<SelectorProps, _, _>((state, props) => ({
  fetching: getFetchingForNarrow(state, props.narrow),
  haveNoMessages: getShownMessagesForNarrow(state, props.narrow).length === 0,
}))(Chat);
