/* @flow */
import React, { PureComponent } from 'react';
import { Platform, StatusBar } from 'react-native';
import { connect } from 'react-redux';
import Color from 'color';

import getStatusBarStyle from '../utils/getStatusBarStyle';
import type { Narrow, ThemeType } from '../types';
import { getTheme } from '../selectors';
import { foregroundColorFromBackground } from '../utils/color';

class ZulipStatusBar extends PureComponent {
  props: {
    hidden: boolean,
    backgroundColor: string,
    narrow?: Narrow,
    theme: ThemeType,
  };

  static defaultProps = {
    hidden: false,
    backgroundColor: 'white',
    theme: 'default',
  };

  render() {
    const { backgroundColor, hidden, narrow, theme } = this.props;
    const textColor = foregroundColorFromBackground(backgroundColor);
    const barStyle = getStatusBarStyle(narrow, textColor, theme);
    return (
      <StatusBar
        animated
        showHideTransition="slide"
        hidden={hidden && Platform.OS !== 'android'}
        backgroundColor={Color(backgroundColor).darken(0.4)}
        barStyle={barStyle}
      />
    );
  }
}

export default connect(
  state => ({
    theme: getTheme(state),
  }),
  null,
)(ZulipStatusBar);
