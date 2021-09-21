/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { Platform, StatusBar } from 'react-native';
// $FlowFixMe[untyped-import]
import Color from 'color';

import type { ThemeName } from '../types';
import { useGlobalSelector } from '../react-redux';
import { foregroundColorFromBackground } from '../utils/color';
import { getGlobalSession, getGlobalSettings } from '../selectors';

type BarStyle = $PropertyType<React$ElementConfig<typeof StatusBar>, 'barStyle'>;

export const getStatusBarColor = (backgroundColor: string | void, theme: ThemeName): string =>
  backgroundColor ?? (theme === 'night' ? 'hsl(212, 28%, 18%)' : 'white');

export const getStatusBarStyle = (statusBarColor: string): BarStyle =>
  foregroundColorFromBackground(statusBarColor) === 'white' /* force newline */
    ? 'light-content'
    : 'dark-content';

type Props = $ReadOnly<{|
  backgroundColor?: string | void,
  hidden?: boolean,
|}>;

/**
 * Renders an RN `StatusBar` with appropriate props, and nothing else.
 *
 * Specifically, it controls the status bar's hidden/visible state and
 * its background color in platform-specific ways. Omitting `hidden`
 * will make the status bar visible, and omitting `backgroundColor`
 * will give a theme-appropriate default.
 *
 * `StatusBar` renders `null` every time. Therefore, don't look to
 * `ZulipStatusBar`'s position in the hierarchy of `View`s to affect
 * the layout in any way.
 *
 * That being said, hiding and un-hiding the status bar can change the
 * size of the top inset. E.g., on an iPhone without the "notch", the
 * top inset grows to accommodate a visible status bar, and shrinks to
 * give more room to the app's content when the status bar is hidden.
 */
export default function ZulipStatusBar(props: Props): Node {
  const { hidden = false } = props;
  const theme = useGlobalSelector(state => getGlobalSettings(state).theme);
  const orientation = useGlobalSelector(state => getGlobalSession(state).orientation);
  const backgroundColor = props.backgroundColor;
  const statusBarColor = getStatusBarColor(backgroundColor, theme);
  return (
    orientation === 'PORTRAIT' && (
      <StatusBar
        animated
        showHideTransition="slide"
        hidden={hidden && Platform.OS !== 'android'}
        backgroundColor={Color(statusBarColor)
          .darken(0.1)
          .hsl()
          .string()}
        barStyle={getStatusBarStyle(statusBarColor)}
      />
    )
  );
}
