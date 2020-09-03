/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';
import type { NavigationScreenProp } from 'react-navigation';

import type { ThemeData } from '../styles';
import styles, { ThemeContext } from '../styles';
import { OfflineNotice, ZulipStatusBar } from '../common';
import MainTabs from './MainTabs';

type Props = $ReadOnly<{|
  navigation: NavigationScreenProp<>,
|}>;

export default class MainScreenWithTabs extends PureComponent<Props> {
  static router = MainTabs.router;

  static contextType = ThemeContext;
  context: ThemeData;

  render() {
    return (
      <View style={[styles.flexed, { backgroundColor: this.context.backgroundColor }]}>
        <ZulipStatusBar />
        <OfflineNotice />
        <MainTabs navigation={this.props.navigation} />
      </View>
    );
  }
}
