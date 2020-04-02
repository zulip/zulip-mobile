/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';
import type { NavigationScreenProp } from 'react-navigation';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import { connect } from '../react-redux';
import type { Context, Dispatch, Fetching, Narrow } from '../types';
import { KeyboardAvoider, OfflineNotice, ZulipStatusBar } from '../common';
import ChatNavBar from '../nav/ChatNavBar';

import MessageList from '../webview/MessageList';
import NoMessages from '../message/NoMessages';
import ComposeBox from '../compose/ComposeBox';
import UnreadNotice from './UnreadNotice';
import styles from '../styles';
import { canSendToNarrow } from '../utils/narrow';
import { getLoading } from '../directSelectors';
import { getFetchingForNarrow } from './fetchingSelectors';
import { getShownMessagesForNarrow } from './narrowsSelectors';

type SelectorProps = {|
  fetching: Fetching,
  haveNoMessages: boolean,
  loading: boolean,
|};

type Props = $ReadOnly<{|
  navigation: NavigationScreenProp<{ params: {| narrow: Narrow |} }>,
  dispatch: Dispatch,

  ...SelectorProps,
|}>;

class ChatScreen extends PureComponent<Props> {
  context: Context;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles: contextStyles } = this.context;
    const { fetching, haveNoMessages, loading, navigation } = this.props;
    const { narrow } = navigation.state.params;

    const isFetching = fetching.older || fetching.newer || loading;
    const showMessagePlaceholders = haveNoMessages && isFetching;
    const sayNoMessages = haveNoMessages && !isFetching;
    const showComposeBox = canSendToNarrow(narrow) && !showMessagePlaceholders;

    return (
      <ActionSheetProvider>
        <View style={contextStyles.screen}>
          <KeyboardAvoider style={styles.flexed} behavior="padding">
            <ZulipStatusBar narrow={narrow} />
            <ChatNavBar narrow={narrow} />
            <OfflineNotice />
            <UnreadNotice narrow={narrow} />
            {sayNoMessages ? (
              <NoMessages narrow={narrow} />
            ) : (
              <MessageList narrow={narrow} showMessagePlaceholders={showMessagePlaceholders} />
            )}
            {showComposeBox && <ComposeBox narrow={narrow} />}
          </KeyboardAvoider>
        </View>
      </ActionSheetProvider>
    );
  }
}

export default connect<SelectorProps, _, _>((state, props) => ({
  loading: getLoading(state),
  fetching: getFetchingForNarrow(state, props.navigation.state.params.narrow),
  haveNoMessages:
    getShownMessagesForNarrow(state, props.navigation.state.params.narrow).length === 0,
}))(ChatScreen);
