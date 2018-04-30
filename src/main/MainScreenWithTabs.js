/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import { ZulipStatusBar } from '../common';
import AppNavigator from '../nav/AppNavigator';
import MainTabs from './MainTabs';

console.log('AppNavigator.router', AppNavigator);

class MainScreenWithTabs extends PureComponent<{}> {
  // static router = AppNavigator.router;

  static contextTypes = {
    styles: () => null,
  };

  componentWillReceiveProps(props) {
    MainScreenWithTabs.router = props.router;
  }

  render() {
    const { styles } = this.context;
    const { navigation, router } = this.props;
    console.log('ZIS PROPS', { navigation, router });
    return (
      <View style={[styles.flexed, styles.backgroundColor]}>
        <ZulipStatusBar />
        <MainTabs router={router} navigation={navigation} />
      </View>
    );
  }
}

// MainScreenWithTabs.router = AppNavigator.router;

export default MainScreenWithTabs;
