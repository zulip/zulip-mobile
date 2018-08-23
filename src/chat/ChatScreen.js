/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import type { NavigationScreenProp } from 'react-navigation';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import type { Auth, Context, EditMessage, Narrow, Message, GlobalState } from '../types';
import { getMessageContentById } from '../api';
import { OfflineNotice, ZulipStatusBar } from '../common';
import { getAuth } from '../selectors';
import Chat from '../chat/Chat';
import ChatNavBar from '../nav/ChatNavBar';

type Props = {|
  auth: Auth,
  navigation: NavigationScreenProp<*> & {
    state: {
      params: {
        narrow: Narrow,
      },
    },
  },
|};

type State = {|
  editMessage: ?EditMessage,
|};

const componentStyles = StyleSheet.create({
  /** A workaround for #3089, by letting us put Chat (with MessageList) first. */
  reverse: {
    flex: 1,
    flexDirection: 'column-reverse',
  },
});

class ChatScreen extends PureComponent<Props, State> {
  context: Context;

  state = {
    editMessage: null,
  };

  static contextTypes = {
    styles: () => null,
  };

  onEditMessageSelect = async (editMessage: Message) => {
    const { auth } = this.props;
    const message = await getMessageContentById(auth, editMessage.id);
    this.setState({
      editMessage: {
        id: editMessage.id,
        content: message,
        topic: editMessage.subject,
      },
    });
  };

  cancelEditMode = (): void => {
    this.setState({
      editMessage: null,
    });
  };

  render() {
    const { editMessage } = this.state;
    const { styles } = this.context;
    const { narrow } = this.props.navigation.state.params;

    return (
      <ActionSheetProvider>
        <View style={styles.screen}>
          <ZulipStatusBar narrow={narrow} />
          <View style={componentStyles.reverse}>
            <Chat
              narrow={narrow}
              cancelEditMode={this.cancelEditMode}
              editMessage={editMessage}
              onEditMessageSelect={this.onEditMessageSelect}
            />
            <OfflineNotice />
            <ChatNavBar narrow={narrow} cancelEditMode={editMessage && this.cancelEditMode} />
          </View>
        </View>
      </ActionSheetProvider>
    );
  }
}

export default connect((state: GlobalState) => ({
  auth: getAuth(state),
}))(ChatScreen);
