/* @flow strict-local */
import React, { useContext } from 'react';
import { View } from 'react-native';

import type { AppNavigationProp, AppNavigationRouteProp } from '../nav/AppNavigator';
import { useSelector } from '../react-redux';
import { getHaveServerData } from '../selectors';
import styles, { ThemeContext } from '../styles';
import { OfflineNotice, ZulipStatusBar } from '../common';
import MainTabs from './MainTabs';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'main'>,
  route: AppNavigationRouteProp<'main'>,
|}>;

export default function MainScreenWithTabs(props: Props) {
  const { backgroundColor } = useContext(ThemeContext);
  const haveServerData = useSelector(getHaveServerData);

  if (!haveServerData) {
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
    <View style={[styles.flexed, { backgroundColor }]}>
      <ZulipStatusBar />
      <OfflineNotice />
      <MainTabs />
    </View>
  );
}
