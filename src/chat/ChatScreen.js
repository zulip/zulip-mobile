/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';
import type { NavigationScreenProp } from 'react-navigation';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import { connect } from '../react-redux';
import type { Context, Dispatch, Fetching, Narrow, EditMessage } from '../types';
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

type State = {|
  editMessage: EditMessage | null,
|};

class ChatScreen extends PureComponent<Props, State> {
  context: Context;
  composeBox: React$ElementRef<typeof ComposeBox> = React.createRef();

  state = {
    editMessage: null,
  };

  static contextTypes = {
    styles: () => null,
  };

  startEditMessage = (editMessage: EditMessage) => {
    this.setState({ editMessage });
  };

  completeEditMessage = () => {
    this.setState({ editMessage: null });
  };

  replyWithMention = (fullName: string, senderId: number, topic?: string) => {
    if (this.composeBox.current !== null) {
      this.composeBox.current
        .getWrappedInstance()
        .handleReplyWithMention(fullName, senderId, topic);
    }
  };

  render() {
    const { styles: contextStyles } = this.context;
    const { fetching, haveNoMessages, loading, navigation } = this.props;
    const { narrow } = navigation.state.params;
    const { editMessage } = this.state;

    const isFetching = fetching.older || fetching.newer || loading;
    const showMessagePlaceholders = haveNoMessages && isFetching;
    const sayNoMessages = haveNoMessages && !isFetching;
    const showComposeBox = canSendToNarrow(narrow) && !showMessagePlaceholders;

    return (
      <ActionSheetProvider>
        <View style={contextStyles.screen}>
          <KeyboardAvoider style={styles.flexed} behavior="padding">
            <ZulipStatusBar narrow={narrow} />
            <ChatNavBar narrow={narrow} editMessage={editMessage} />
            <OfflineNotice />
            <UnreadNotice narrow={narrow} />
            {sayNoMessages ? (
              <NoMessages narrow={narrow} />
            ) : (
              <MessageList
                narrow={narrow}
                showMessagePlaceholders={showMessagePlaceholders}
                startEditMessage={this.startEditMessage}
                replyWithMention={this.replyWithMention}
              />
            )}
            {showComposeBox && (
              <ComposeBox
                narrow={narrow}
                editMessage={editMessage}
                completeEditMessage={this.completeEditMessage}
                ref={this.composeBox}
              />
            )}
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
