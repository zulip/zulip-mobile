import React from 'react';
import {
  StyleSheet,
  View,
  Animated,
} from 'react-native';

import { BRAND_COLOR } from '../styles';

import Tab from './Tab';

const styles = StyleSheet.create({
  tabs: {
    height: 44,
    backgroundColor: BRAND_COLOR,
    flexDirection: 'row',
    shadowColor: 'black',
    shadowOpacity: 1,
    shadowRadius: 5,
  },
});

export default class MainTabBar extends React.Component {

  props: {
    goToPage: () => void,
  }

  render() {
    const { goToPage, containerWidth, underlineStyle, scrollValue } = this.props;
    const tabUnderlineStyle = {
      position: 'absolute',
      width: containerWidth / 4,
      height: 3,
      backgroundColor: 'white',
      bottom: 0,
    };
    const left = scrollValue.interpolate({
      inputRange: [0, 1], outputRange: [0, containerWidth / 4],
    });

    return (
      <View style={styles.tabs}>
        <Tab activity={99} index={0} icon="md-home" onPress={goToPage} />
        <Tab index={1} icon="md-at" onPress={goToPage} />
        <Tab index={2} icon="md-chatboxes" onPress={goToPage} />
        <Tab index={3} icon="md-person" onPress={goToPage} />
        <Animated.View style={[tabUnderlineStyle, { left }, underlineStyle]} />
      </View>
    );
  }
}
