/* @flow */
import React, { PureComponent } from 'react';
import { Platform, StatusBar, View } from 'react-native';
import Color from 'color';

import type { Dimensions, StatusBarStyle, ThemeType } from '../types';
import connectWithActions from '../connectWithActions';
import { getSession, getSettings, getTitleBackgroundColor, getTitleTextColor } from '../selectors';
import getStatusBarStyle from '../utils/getStatusBarStyle';
import getStatusBarColor from '../utils/getStatusBarColor';

type Props = {
  barStyle?: StatusBarStyle,
  hidden: boolean,
  theme: ThemeType,
  backgroundColor: string,
  safeAreaInsets: Dimensions,
  textColor: string,
  orientation: string,
};

class ZulipStatusBar extends PureComponent<Props> {
  static contextTypes = {
    styles: () => null,
  };

  props: Props;

  static defaultProps = {
    hidden: false,
  };

  render() {
    const {
      theme,
      backgroundColor,
      textColor,
      hidden,
      barStyle,
      safeAreaInsets,
      orientation,
    } = this.props;
    const style = { height: hidden ? 0 : safeAreaInsets.top, backgroundColor };
    const statusBarStyle = !barStyle
      ? getStatusBarStyle(backgroundColor, textColor, theme)
      : barStyle;
    const statusBarColor = getStatusBarColor(backgroundColor, theme);
    return (
      orientation === 'PORTRAIT' && (
        <View style={style}>
          <StatusBar
            animated
            showHideTransition="slide"
            hidden={hidden && Platform.OS !== 'android'}
            backgroundColor={Color(statusBarColor).darken(0.1)}
            barStyle={statusBarStyle}
          />
        </View>
      )
    );
  }
}

export default connectWithActions((state, props) => ({
  safeAreaInsets: getSession(state).safeAreaInsets,
  theme: getSettings(state).theme,
  backgroundColor: !props.backgroundColor
    ? getTitleBackgroundColor(props.narrow)(state)
    : props.backgroundColor,
  textColor: getTitleTextColor(props.narrow)(state),
  orientation: getSession(state).orientation,
}))(ZulipStatusBar);
