/* @flow strict-local */

import React, { PureComponent } from 'react';
import { Platform, StatusBar } from 'react-native';
import Color from 'color';

import type { Orientation, ThemeName, Dispatch } from '../types';
import { connect } from '../react-redux';
import { DEFAULT_TITLE_BACKGROUND_COLOR } from '../title/titleSelectors';
import { foregroundColorFromBackground } from '../utils/color';
import { getSession, getSettings } from '../selectors';

type BarStyle = $PropertyType<React$ElementConfig<typeof StatusBar>, 'barStyle'>;

export const getStatusBarColor = (backgroundColor: string, theme: ThemeName): string =>
  backgroundColor === DEFAULT_TITLE_BACKGROUND_COLOR
    ? theme === 'night'
      ? 'hsl(212, 28%, 18%)'
      : 'white'
    : backgroundColor;

export const getStatusBarStyle = (statusBarColor: string): BarStyle =>
  foregroundColorFromBackground(statusBarColor) === 'white' /* force newline */
    ? 'light-content'
    : 'dark-content';

type SelectorProps = $ReadOnly<{|
  theme: ThemeName,
  orientation: Orientation,
|}>;

type Props = $ReadOnly<{
  backgroundColor: string,
  hidden: boolean,

  dispatch: Dispatch,
  ...SelectorProps,
}>;

/**
 * Applies `hidden` and `backgroundColor` in platform-specific ways.
 *
 * Like `StatusBar`, which is the only thing it ever renders, this
 * doesn't have any effect on the spatial layout of the UI.
 */
class ZulipStatusBar extends PureComponent<Props> {
  static defaultProps = {
    hidden: false,
    backgroundColor: DEFAULT_TITLE_BACKGROUND_COLOR,
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
          backgroundColor={Color(statusBarColor).darken(0.1)}
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
