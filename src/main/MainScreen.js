/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import { ZulipStatusBar } from '../common';
import ChatContainer from '../chat/ChatContainer';
import MainNavBar from '../nav/MainNavBar';

type Props = {
  navigation: any,
};

export default class MainScreen extends PureComponent<Props> {
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  handlePressStreams = () => {
    this.props.navigation.navigate('DrawerOpen');
  };

  render() {
    const { styles } = this.context;

    return (
      <View style={styles.flexed}>
        <ZulipStatusBar />
        <MainNavBar onPressStreams={this.handlePressStreams} />
        <ChatContainer />
      </View>
    );
  }
}
