/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';
import type { NavigationScreenProp } from 'react-navigation';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import type { Context, Narrow, Message } from '../types';
import { OfflineNotice, ZulipStatusBar } from '../common';
import Chat from '../chat/Chat';
import ChatNavBar from '../nav/ChatNavBar';

type Props = {|
  navigation: NavigationScreenProp<*> & {
    state: {
      params: {
        narrow: Narrow,
      },
    },
  },
|};

type State = {|
  editMessage: ?Message,
|};

const componentStyles = StyleSheet.create({
  /** A workaround for #3089, by letting us put Chat (with MessageList) first. */
  reverse: {
    flex: 1,
    flexDirection: 'column-reverse',
  },
});

export default class ChatScreen extends PureComponent<Props, State> {
  context: Context;

  state = {
    editMessage: null, // eslint-disable-line
  };

  static contextTypes = {
    styles: () => null,
  };

  onEditMessageSelect = (editMessage: Message): void => {
    this.setState({ editMessage }); // eslint-disable-line
  };

  render() {
    const { styles } = this.context;
    const { narrow } = this.props.navigation.state.params;

    return (
      <ActionSheetProvider>
        <View style={styles.screen}>
          <ZulipStatusBar narrow={narrow} />
          <View style={componentStyles.reverse}>
            <Chat narrow={narrow} onEditMessageSelect={this.onEditMessageSelect} />
            <OfflineNotice />
            <ChatNavBar narrow={narrow} />
          </View>
        </View>
      </ActionSheetProvider>
    );
  }
}
