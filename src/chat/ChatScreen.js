/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

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
      <View style={styles.screen}>
        <ZulipStatusBar />
        <MainNavBar />
        <Chat />
      </View>
    );
  }
}
