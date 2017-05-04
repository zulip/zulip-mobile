/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import Chat from '../chat/Chat';
import MainNavBar from '../nav/MainNavBar';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'column',
  },
});

export default class MainScreen extends PureComponent {
  handlePressPeople = () => {
    this.props.usersNavigation.navigate('DrawerOpen');
  };

  handlePressStreams = () => {
    this.props.streamsNavigation.navigate('DrawerOpen');
  };

  render() {
    return (
      <View style={styles.wrapper}>
        <MainNavBar
          onPressPeople={this.handlePressPeople}
          onPressStreams={this.handlePressStreams}
        />
        <Chat {...this.props} />
      </View>
    );
  }
}
