/* @flow strict-local */

import React from 'react';

import type { Node as React$Node } from 'react';
import { useSelector } from '../react-redux';
import { getSettings } from '../directSelectors';
import { themeData, ThemeContext } from '../styles/theme';
import { ZulipStatusBar } from '../common';

type Props = $ReadOnly<{|
  children: React$Node,
|}>;

export default function ThemeProvider(props: Props) {
  const { children } = props;
  const theme = useSelector(state => getSettings(state).theme);
  return (
    <ThemeContext.Provider value={themeData[theme]}>
      <ZulipStatusBar />
      {children}
    </ThemeContext.Provider>
  );
}
