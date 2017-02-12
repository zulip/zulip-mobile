import React from 'react';
import { StyleSheet, Navigator, View } from 'react-native';

import { styles } from '../common';
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
    const { openStreamList, onPressPeople, backgroundColor } = this.props;
    const textColor = foregroundColorFromBackground(backgroundColor);
    return (
      <Navigator
        initialRoute={{ name: 'Home', index: 0 }}
        renderScene={(route) =>
          <View style={moreStyles.wrapper}>
            <View style={styles.navBar}>
              <NavButton name="ios-menu" color={textColor} onPress={openStreamList} />
              <Title backgroundColor={backgroundColor} />
              <NavButton name="md-people" color={textColor} onPress={onPressPeople} />
            </View>
            {this.props.children}
          </View>
        }
      />
    );
  }
}
