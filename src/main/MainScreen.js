/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import Chat from '../chat/Chat';
import MainNavBar from '../nav/MainNavBar';

export default class MainScreen extends PureComponent {
  static contextTypes = {
    styles: () => null,
  };

  handlePressPeople = () => {
    this.props.usersNavigation.navigate('DrawerOpen');
  };

  handlePressStreams = () => {
    this.props.streamsNavigation.navigate('DrawerOpen');
  };

  render() {
    const { styles } = this.context;

    return (
      <View style={styles.screen}>
        <MainNavBar
          onPressPeople={this.handlePressPeople}
          onPressStreams={this.handlePressStreams}
        />
        <Chat />
      </View>
    );
  }
}
