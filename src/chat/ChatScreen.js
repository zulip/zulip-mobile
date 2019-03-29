/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';
import type { NavigationScreenProp, NavigationStateRoute } from 'react-navigation';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import type { Context, Narrow } from '../types';
import { OfflineNotice, ZulipStatusBar } from '../common';
import Chat from '../chat/Chat';
import ChatNavBar from '../nav/ChatNavBar';

type Props = {|
  navigation: NavigationScreenProp<NavigationStateRoute>,
|};

const styles = StyleSheet.create({
  /** A workaround for #3089, by letting us put Chat (with MessageList) first. */
  reverse: {
    flexDirection: 'column-reverse',
  },
});

export default class ChatScreen extends PureComponent<Props> {
  context: Context;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles: contextStyles } = this.context;
    const narrow: Narrow = this.props.navigation.getParam('narrow');

    return (
      <ActionSheetProvider>
        <View style={[contextStyles.screen, styles.reverse]}>
          <Chat narrow={narrow} />
          <OfflineNotice />
          <ChatNavBar narrow={narrow} />
          <ZulipStatusBar narrow={narrow} />
        </View>
      </ActionSheetProvider>
    );
  }
}
