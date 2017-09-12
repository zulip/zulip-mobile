/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import { ZulipStatusBar } from '../common';
import ChatContainer from '../chat/ChatContainer';
import MainNavBar from '../nav/MainNavBar';

export default class MainScreen extends PureComponent {
  static contextTypes = {
    styles: () => null,
  };

  handlePressStreams = () => {
    this.props.navigation.navigate('DrawerOpen');
  };

  render() {
    const { styles } = this.context;

    return (
      <View style={styles.screen}>
        <ZulipStatusBar />
        <MainNavBar onPressStreams={this.handlePressStreams} />
        <ChatContainer />
      </View>
    );
  }
}
