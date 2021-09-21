/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';

import { useGlobalSelector } from '../react-redux';
import { getGlobalSettings } from '../directSelectors';
import { themeData, ThemeContext } from '../styles/theme';
import { ZulipStatusBar } from '../common';

type Props = $ReadOnly<{|
  children: Node,
|}>;

export default function ThemeProvider(props: Props): Node {
  const { children } = props;
  const theme = useGlobalSelector(state => getGlobalSettings(state).theme);
  return (
    <ThemeContext.Provider value={themeData[theme]}>
      <ZulipStatusBar />
      {children}
    </ThemeContext.Provider>
  );
}
