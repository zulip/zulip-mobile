/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';
import type { NavigationScreenProp } from 'react-navigation';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import type { Context, Narrow } from '../types';
import { OfflineNotice, ZulipStatusBar } from '../common';
import Chat from '../chat/Chat';
import MainNavBar from '../nav/MainNavBar';

type Props = {
  navigation: NavigationScreenProp<*> & {
    state: {
      params: {
        narrow: Narrow,
      },
    },
  },
};

export default class ChatScreen extends PureComponent<Props> {
  context: Context;
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles } = this.context;
    const { narrow } = this.props.navigation.state.params;

    return (
      <ActionSheetProvider>
        <View style={styles.screen}>
          <ZulipStatusBar narrow={narrow} />
          <MainNavBar narrow={narrow} />
          <OfflineNotice />
          <Chat narrow={narrow} />
        </View>
      </ActionSheetProvider>
    );
  }
}
