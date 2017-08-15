/* @flow */
import React, { PureComponent } from 'react';
import { Platform, StatusBar } from 'react-native';
import { connect } from 'react-redux';

import type { ThemeType } from '../types';
import { getTheme } from '../selectors';
import { foregroundColorFromBackground } from '../utils/color';

class ZulipStatusBar extends PureComponent {
  props: {
    hidden: boolean,
    backgroundColor: string,
    theme: ThemeType,
  };

  static defaultProps = {
    hidden: false,
    backgroundColor: 'white',
    theme: 'default',
  };

  render() {
    const { theme, hidden, backgroundColor } = this.props;
    const textColor = foregroundColorFromBackground(backgroundColor);
    const barStyle = textColor === 'white' && theme === 'night' ? 'light-content' : 'dark-content';

    return (
      <StatusBar
        animated
        showHideTransition="slide"
        hidden={hidden && Platform.OS !== 'android'}
        backgroundColor={backgroundColor}
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
