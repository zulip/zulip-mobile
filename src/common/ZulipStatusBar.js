/* @flow */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Platform, StatusBar, View } from 'react-native';
import Color from 'color';

import { STATUSBAR_HEIGHT } from '../styles/platform';
import { getTitleBackgroundColor, getTitleTextColor } from '../selectors';
import getStatusBarStyle from '../utils/getStatusBarStyle';
import getStatusBarColor from '../utils/getStatusBarColor';

class ZulipStatusBar extends PureComponent {
  static contextTypes = {
    styles: () => null,
  };

  props: {
    fullScreen?: boolean,
    hidden: boolean,
    theme: string,
    backgroundColor: string,
    textColor: string,
  };

  static defaultProps = {
    hidden: false,
  };

  render() {
    const { theme, backgroundColor, textColor, hidden, fullScreen } = this.props;
    const style = { height: hidden ? 0 : STATUSBAR_HEIGHT, backgroundColor };
    const barStyle = getStatusBarStyle(backgroundColor, textColor, theme);
    const statusBarColor = getStatusBarColor(backgroundColor, theme);
    return (
      <View style={style}>
        <StatusBar
          animated
          showHideTransition="slide"
          hidden={hidden && (fullScreen || Platform.OS !== 'android')}
          backgroundColor={Color(statusBarColor).darken(0.4)}
          barStyle={barStyle}
        />
      </View>
    );
  }
}

export default connect(state => ({
  theme: state.settings.theme,
  backgroundColor: getTitleBackgroundColor(state),
  textColor: getTitleTextColor(state),
}))(ZulipStatusBar);
