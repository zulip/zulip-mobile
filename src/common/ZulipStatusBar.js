/* @flow */
import React, { PureComponent } from 'react';
import { Platform, StatusBar, View } from 'react-native';
import Color from 'color';

import type { Dimensions, StatusBarStyle } from '../types';
import connectWithActions from '../connectWithActions';
import { getTitleBackgroundColor, getTitleTextColor } from '../selectors';
import getStatusBarStyle from '../utils/getStatusBarStyle';
import getStatusBarColor from '../utils/getStatusBarColor';
import { NULL_SAFE_AREA_INSETS } from '../nullObjects';

type Props = {
  barStyle?: StatusBarStyle,
  hidden: boolean,
  theme: string,
  backgroundColor: string,
  safeAreaInsets: Dimensions,
  textColor: string,
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
    const { theme, backgroundColor, textColor, hidden, barStyle, safeAreaInsets } = this.props;
    const style = {
      height: hidden ? 0 : (safeAreaInsets || NULL_SAFE_AREA_INSETS).top,
      backgroundColor,
    };
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
          backgroundColor={Color(statusBarColor).darken(0.1)}
          barStyle={statusBarStyle}
        />
      </View>
    );
  }
}

export default connectWithActions((state, props) => ({
  safeAreaInsets: state.device.safeAreaInsets,
  theme: state.settings.theme,
  backgroundColor: !props.backgroundColor ? getTitleBackgroundColor(state) : props.backgroundColor,
  textColor: getTitleTextColor(state),
}))(ZulipStatusBar);
