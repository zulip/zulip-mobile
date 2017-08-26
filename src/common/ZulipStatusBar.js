/* @flow */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Platform, StatusBar, View } from 'react-native';

import { STATUSBAR_HEIGHT } from '../styles/platform';
import { getTitleBackgroundColor, getTitleTextColor } from '../selectors';
import getStatusBarStyle from '../utils/getStatusBarStyle';

class ZulipStatusBar extends PureComponent {
  static contextTypes = {
    styles: () => null,
  };

  props: {
    hidden: boolean,
    theme: string,
    backgroundColor: string,
    textColor: string,
  };

  static defaultProps = {
    hidden: false,
  };

  render() {
    const { theme, backgroundColor, textColor, hidden } = this.props;
    const style = { height: STATUSBAR_HEIGHT, backgroundColor };
    const barStyle = getStatusBarStyle(backgroundColor, textColor, theme);
    return (
      <View style={style}>
        <StatusBar
          animated
          showHideTransition="slide"
          hidden={hidden && Platform.OS !== 'android'}
          backgroundColor={backgroundColor}
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
