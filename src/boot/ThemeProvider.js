/* @flow strict-local */

import React from 'react';
import { useColorScheme } from 'react-native';

import type { Node as React$Node } from 'react';
import { useSelector } from '../react-redux';
import { getSettings } from '../directSelectors';
import { themeData, ThemeContext } from '../styles/theme';
import { ZulipStatusBar } from '../common';

type Props = $ReadOnly<{|
  children: React$Node,
|}>;

function ThemeProvider(props: Props) {
  const theme = useSelector(state => getSettings(state).theme);
  const { children } = props;
  const colorScheme = useColorScheme();
  let themeToUse = theme;

  if (themeToUse === 'automatic') {
    themeToUse = colorScheme === 'light' || colorScheme == null ? 'light' : 'night';
  }

  return (
    <ThemeContext.Provider value={themeData[themeToUse]}>
      <ZulipStatusBar />
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
