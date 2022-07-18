// @flow strict-local
import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BRAND_COLOR } from '../styles';
import { useGlobalSelector } from '../react-redux';
import { getGlobalSettings, getIsHydrated } from '../directSelectors';
import { themeData } from '../styles/theme';

type Props = {|
  +children: React.Node,
|};

export default function ZulipSafeAreaProvider(props: Props): React.Node {
  // This background color appears in at least one situation:
  //
  //  * At startup, just after the loading screen, it covers the whole
  //    screen as a brief flash, just a frame or so.
  //
  // We can make this quirk virtually invisible by giving it the background
  // color used across the app.
  const backgroundColor = useGlobalSelector(state => {
    if (!getIsHydrated(state)) {
      // The only screen we'll be showing at this point is the loading
      // screen.  Match that screen's background.
      return BRAND_COLOR;
    }

    return themeData[getGlobalSettings(state).theme].backgroundColor;
  });

  return <SafeAreaProvider style={{ backgroundColor }}>{props.children}</SafeAreaProvider>;
}
