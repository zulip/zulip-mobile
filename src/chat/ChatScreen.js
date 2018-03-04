/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import { ZulipStatusBar } from '../common';
import Chat from '../chat/Chat';
import MainNavBar from '../nav/MainNavBar';

export default class ChatScreen extends PureComponent<{}> {
  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles } = this.context;

    return (
      <ActionSheetProvider>
        <View style={styles.screen}>
          <ZulipStatusBar />
          <MainNavBar />
          <Chat />
        </View>
      </ActionSheetProvider>
    );
  }
}
