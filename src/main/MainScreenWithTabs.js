/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { AppNavigationProp } from '../nav/AppNavigator';
import type { Dispatch } from '../types';
import { connect } from '../react-redux';
import { getHaveServerData } from '../selectors';
import type { ThemeData } from '../styles';
import styles, { ThemeContext } from '../styles';
import { OfflineNotice, ZulipStatusBar } from '../common';
import MainTabs from './MainTabs';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'main'>,

  dispatch: Dispatch,
  haveServerData: boolean,
|}>;

class MainScreenWithTabs extends PureComponent<Props> {
  static contextType = ThemeContext;
  context: ThemeData;

  render() {
    if (!this.props.haveServerData) {
      // This can happen if the user has just logged out; this screen
      // is still visible for the duration of the nav transition, and
      // it's legitimate for its `render` to get called again.
      // See our #4275.
      //
      // Avoid rendering any of our main UI in this case, to maintain
      // the guarantee that it can all rely on server data existing.
      return null;
    }

    return (
      <View style={[styles.flexed, { backgroundColor: this.context.backgroundColor }]}>
        <ZulipStatusBar />
        <OfflineNotice />
        <MainTabs />
      </View>
    );
  }
}

export default connect(state => ({
  haveServerData: getHaveServerData(state),
}))(MainScreenWithTabs);
