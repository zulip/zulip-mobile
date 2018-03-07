/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import type { Narrow } from '../types';
import { ZulipStatusBar } from '../common';
import Chat from '../chat/Chat';
import MainNavBar from '../nav/MainNavBar';

type Props = {
  navigation: {
    state: {
      params: {
        narrow: Narrow,
      },
    },
  },
};

export default class ChatScreen extends PureComponent<Props> {
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
          <Chat narrow={narrow} />
        </View>
      </ActionSheetProvider>
    );
  }
}
