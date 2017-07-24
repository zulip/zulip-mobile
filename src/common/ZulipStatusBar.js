/* @flow */
import React, { PureComponent } from 'react';
import { Platform, StatusBar } from 'react-native';

import { foregroundColorFromBackground } from '../utils/color';

export default class ZulipStatusBar extends PureComponent {
  props: {
    hidden: boolean,
    backgroundColor: string,
  };

  static defaultProps = {
    hidden: false,
    backgroundColor: 'white',
  };

  render() {
    const { hidden, backgroundColor } = this.props;
    const textColor = foregroundColorFromBackground(backgroundColor);
    const barStyle = textColor === 'white' ? 'light-content' : 'dark-content';

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
