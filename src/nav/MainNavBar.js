import React from 'react';
import {
  StyleSheet,
  Navigator,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import styles from '../common/styles';

import Title from '../title/Title';

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
            <View style={[styles.navBar, { backgroundColor }]}>
              <Icon style={[styles.navButton, { color: textColor }]} name="ios-menu" onPress={openStreamList} />
              <Title backgroundColor={backgroundColor} />
              <Icon style={[styles.navButton, { color: textColor }]} name="md-people" onPress={onPressPeople} />
            </View>
            {this.props.children}
          </View>
        }
      />
    );
  }
}
