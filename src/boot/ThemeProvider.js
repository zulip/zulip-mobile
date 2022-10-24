/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { useColorScheme } from 'react-native';

import { useGlobalSelector } from '../react-redux';
import { getGlobalSettings } from '../directSelectors';
import { themeData, ThemeContext } from '../styles/theme';
import ZulipStatusBar from '../common/ZulipStatusBar';
import { getThemeToUse } from '../settings/settingsSelectors';

type Props = $ReadOnly<{|
  children: Node,
|}>;

export default function ThemeProvider(props: Props): Node {
  const { children } = props;
  const theme = useGlobalSelector(state => getGlobalSettings(state).theme);
  const osScheme = useColorScheme();
  const themeToUse = getThemeToUse(theme, osScheme);

  return (
    <ThemeContext.Provider value={themeData[themeToUse]}>
      <ZulipStatusBar />
      {children}
    </ThemeContext.Provider>
  );
}
