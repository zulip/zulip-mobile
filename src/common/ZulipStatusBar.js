import React from 'react';
import { Platform, StatusBar } from 'react-native';

import { foregroundColorFromBackground } from '../utils/color';

export default (props) => {
  const backgroundColor = props.backgroundColor || 'white';
  const textColor = foregroundColorFromBackground(backgroundColor);
  const barStyle = textColor === 'white' ? 'light-content' : 'dark-content';

  return (
    <StatusBar
      animated
      showHideTransition="slide"
      hidden={props.hidden && Platform.OS !== 'android'}
      backgroundColor={backgroundColor}
      barStyle={barStyle}
    />
  );
};
