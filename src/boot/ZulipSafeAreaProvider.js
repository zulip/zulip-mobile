// @flow strict-local
import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';

import { BRAND_COLOR } from '../styles';
import { useGlobalSelector } from '../react-redux';
import { getGlobalSettings, getIsHydrated } from '../directSelectors';
import { themeData } from '../styles/theme';
import { getThemeToUse } from '../settings/settingsSelectors';

type Props = {|
  +children: React.Node,
|};

export default function ZulipSafeAreaProvider(props: Props): React.Node {
  // This background color appears in a few situations:
  //
  //  * At startup, just after the loading screen, it covers the whole
  //    screen as a brief flash, just a frame or so.
  //
  //  * On iOS (where the stack-navigation transition animations have the
  //    new screen slide in from and out to the right), when the animation
  //    has all but the leftmost few pixels covered by the new screen, this
  //    color replaces the remaining sliver of the old screen.  In
  //    particular this means at the very end of a push transition, and the
  //    very beginning of a pop, particularly when the user pops by dragging
  //    so that the animation goes at the pace of the user's finger.
  //
  // We can make this quirk virtually invisible by giving it the background
  // color used across the app.
  const osScheme = useColorScheme();

  const backgroundColor = useGlobalSelector(state => {
    if (!getIsHydrated(state)) {
      // The only screen we'll be showing at this point is the loading
      // screen.  Match that screen's background.
      return BRAND_COLOR;
    }

    const theme = getGlobalSettings(state).theme;
    const themeToUse = getThemeToUse(theme, osScheme);
    return themeData[themeToUse].backgroundColor;
  });

  return <SafeAreaProvider style={{ backgroundColor }}>{props.children}</SafeAreaProvider>;
}
