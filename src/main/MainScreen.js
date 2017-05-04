import React from 'react';
import { StyleSheet, View } from 'react-native';

import Chat from '../chat/Chat';
import MainNavBar from '../nav/MainNavBar';
import { StreamDrawer, UsersDrawer } from './Drawers';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'column',
  },
});

export default class MainScreen extends React.Component {

  static navigationOptions = {
    title: 'Welcome',
  };

  constructor(props) {
    super(props);
    this.state = {
      leftDrawerOpen: false,
      rightDrawerOpen: false,
    };
  }

  handlePressPeople = () => {
    console.log(this.props);
    console.log(UsersDrawer);
    this.props.navigation.navigate('DrawerOpen');
  }

  handlePressStreams = () => {
    StreamDrawer.navigate('DrawerOpen');
  }

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
