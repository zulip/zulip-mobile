/* @flow */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Platform, StatusBar, View } from 'react-native';
import Color from 'color';

import type { StatusBarStyle } from '../types';
import { STATUSBAR_HEIGHT } from '../styles/platform';
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
    textColor: string,
  };

  static defaultProps = {
    hidden: false,
  };

  render() {
    const { theme, backgroundColor, textColor, hidden, barStyle } = this.props;
    const style = { height: hidden ? 0 : STATUSBAR_HEIGHT, backgroundColor };
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
  theme: state.settings.theme,
  backgroundColor: !props.backgroundColor ? getTitleBackgroundColor(state) : props.backgroundColor,
  textColor: getTitleTextColor(state),
}))(ZulipStatusBar);
