/* @flow strict-local */

import React, { PureComponent } from 'react';
import { Platform, StatusBar, View } from 'react-native';
import Color from 'color';

import { connect } from 'react-redux';
import type { Dimensions, GlobalState, Narrow, Orientation, ThemeName, Dispatch } from '../types';
import { DEFAULT_TITLE_BACKGROUND_COLOR, getTitleBackgroundColor } from '../title/titleSelectors';
import { foregroundColorFromBackground } from '../utils/color';
import { getSession, getSettings } from '../selectors';

type BarStyle = $PropertyType<$PropertyType<StatusBar, 'props'>, 'barStyle'>;

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

type SelectorProps = {|
  theme: ThemeName,
  safeAreaInsets: Dimensions,
  orientation: Orientation,
  backgroundColor: string,
  hidden: boolean,
|};

type RawProps = $ReadOnly<{|
  backgroundColor?: string,
  hidden?: boolean,
  narrow?: Narrow,
|}>;

type Props = $ReadOnly<{|
  dispatch: Dispatch,
  ...RawProps,
  ...SelectorProps,
|}>;

/**
 * Controls the status bar settings depending on platform
 * and current navigation position.
 * If narrowed to a stream or topic the color of the status bar
 * matches that of the stream.
 *
 * @prop [narrow] - Currently active narrow.
 */
class ZulipStatusBar extends PureComponent<Props> {
  /* static defaultProps = {
    hidden: false,
  }; */

  render() {
    const { theme, backgroundColor, hidden, safeAreaInsets, orientation } = this.props;
    const style = { height: hidden ? 0 : safeAreaInsets.top, backgroundColor };
    const statusBarColor = getStatusBarColor(backgroundColor, theme);
    return (
      orientation === 'PORTRAIT' && (
        <View style={style}>
          <StatusBar
            animated
            showHideTransition="slide"
            hidden={hidden && Platform.OS !== 'android'}
            backgroundColor={Color(statusBarColor).darken(0.1)}
            barStyle={getStatusBarStyle(statusBarColor)}
          />
        </View>
      )
    );
  }
}

/** mapStateToProps: map state and props to props. */
const mapStateToProps = (state: GlobalState, props: RawProps): SelectorProps => ({
  safeAreaInsets: getSession(state).safeAreaInsets,
  theme: getSettings(state).theme,
  backgroundColor: props.backgroundColor ?? getTitleBackgroundColor(props.narrow)(state),
  orientation: getSession(state).orientation,
  hidden: props.hidden ?? false,
});

// We use the underlying Redux-provided Flow type wrapper here, as our own can't
// currently handle the redefinition of `backgroundColor`.
//
// As noted in the docstrings of our react-redux wrapper, there are situations
// in which this is unsafe. It is believed that these are ruled out by
// explicitly specifying both a) the argument and return types of
// `mapStateToProps`, and b) the first three generic parameters below.
export default connect<Props, RawProps, SelectorProps, _, _, _>(mapStateToProps)(ZulipStatusBar);
