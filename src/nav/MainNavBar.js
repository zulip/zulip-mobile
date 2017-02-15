import React from 'react';
import { Navigator, StatusBar, StyleSheet, View } from 'react-native';

import { styles } from '../common';
import { BRAND_COLOR } from '../common/styles';
import Title from '../title/Title';
import NavButton from './NavButton';

import { foregroundColorFromBackground } from '../utils/color';

const moreStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'column',
  },
});

export default class MainNavBar extends React.Component {
  render() {
    const { onPressStreams, onPressPeople } = this.props;
    let { backgroundColor } = this.props;

    let textColor = BRAND_COLOR;
    if (backgroundColor) {
      textColor = foregroundColorFromBackground(backgroundColor);
    } else {
      backgroundColor = '#ffffff';
    }

    return (
      <Navigator
        initialRoute={{ name: 'Home', index: 0 }}
        renderScene={(route) =>
          <View style={moreStyles.wrapper}>
            <StatusBar
              barStyle={textColor === 'white' ? 'light-content' : 'dark-content'}
            />
            <View style={[styles.navBar, { backgroundColor }]}>
              <NavButton name="ios-menu" color={textColor} onPress={onPressStreams} />
              <Title color={textColor} />
              <NavButton name="md-people" color={textColor} onPress={onPressPeople} />
            </View>
            {this.props.children}
          </View>
        }
      />
    );
  }
}
