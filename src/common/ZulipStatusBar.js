/* @flow */
import React, { PureComponent } from 'react';
import { Platform, StatusBar, View } from 'react-native';
import { connect } from 'react-redux';
import Color from 'color';

import type { Dimensions, StatusBarStyle } from '../types';
import { getTitleBackgroundColor, getTitleTextColor } from '../selectors';
import getStatusBarStyle from '../utils/getStatusBarStyle';
import getStatusBarColor from '../utils/getStatusBarColor';

class ZulipStatusBar extends PureComponent {
  static contextTypes = {
    styles: () => null,
  };

  props: {
    barStyle?: StatusBarStyle,
    hidden: boolean,
    theme: string,
    backgroundColor: string,
    safeAreaInsets: Dimensions,
    textColor: string,
  };

  static defaultProps = {
    hidden: false,
  };

  render() {
    const { theme, backgroundColor, textColor, hidden, barStyle, safeAreaInsets } = this.props;
    const style = { height: hidden ? 0 : safeAreaInsets.top, backgroundColor };
    const statusBarStyle = !barStyle
      ? getStatusBarStyle(backgroundColor, textColor, theme)
      : barStyle;
    const statusBarColor = getStatusBarColor(backgroundColor, theme);
    return (
      <View style={style}>
        <StatusBar
          animated
          showHideTransition="slide"
          hidden={hidden && Platform.OS !== 'android'}
          backgroundColor={Color(statusBarColor).darken(0.4)}
          barStyle={statusBarStyle}
        />
      </View>
    );
  }
}

export default connect((state, props) => ({
  safeAreaInsets: state.app.safeAreaInsets,
  theme: state.settings.theme,
  backgroundColor: !props.backgroundColor ? getTitleBackgroundColor(state) : props.backgroundColor,
  textColor: getTitleTextColor(state),
}))(ZulipStatusBar);
