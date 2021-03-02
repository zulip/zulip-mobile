/* @flow strict-local */

import React, { PureComponent } from 'react';
import { Platform, StatusBar } from 'react-native';
import Color from 'color';

import type { Orientation, ThemeName, Dispatch } from '../types';
import { connect } from '../react-redux';
import { foregroundColorFromBackground } from '../utils/color';
import { getSession, getSettings } from '../selectors';

type BarStyle = $PropertyType<React$ElementConfig<typeof StatusBar>, 'barStyle'>;

export const getStatusBarColor = (backgroundColor: string | void, theme: ThemeName): string =>
  backgroundColor ?? (theme === 'night' ? 'hsl(212, 28%, 18%)' : 'white');

export const getStatusBarStyle = (statusBarColor: string): BarStyle =>
  foregroundColorFromBackground(statusBarColor) === 'white' /* force newline */
    ? 'light-content'
    : 'dark-content';

type SelectorProps = $ReadOnly<{|
  theme: ThemeName,
  orientation: Orientation,
|}>;

type Props = $ReadOnly<{|
  backgroundColor?: string | void,
  hidden: boolean,

  dispatch: Dispatch,
  ...SelectorProps,
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
class ZulipStatusBar extends PureComponent<Props> {
  static defaultProps = {
    hidden: false,
  };

  render() {
    const { theme, hidden, orientation } = this.props;
    const backgroundColor = this.props.backgroundColor;
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
}

export default connect<SelectorProps, _, _>((state, props) => ({
  theme: getSettings(state).theme,
  orientation: getSession(state).orientation,
}))(ZulipStatusBar);
