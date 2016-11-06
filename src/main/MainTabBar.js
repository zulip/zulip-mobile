import React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

import { BRAND_COLOR, STATUSBAR_HEIGHT } from '../common/styles';
import Tab from './Tab';

const styles = StyleSheet.create({
  tabs: {
    paddingTop: STATUSBAR_HEIGHT,
    height: 44 + STATUSBAR_HEIGHT,
    flexDirection: 'row',
    backgroundColor: BRAND_COLOR,
    shadowColor: 'black',
    shadowOpacity: 1,
    shadowRadius: 5,
  },
});

export default class MainTabBar extends React.Component {

  props: {
    goToPage: () => {};
  }

  render() {
    const { goToPage } = this.props;

    return (
      <View style={styles.tabs}>
        <Tab index={0} icon="md-home" onPress={goToPage} />
        <Tab index={1} icon="md-at" onPress={goToPage} />
        <Tab index={2} icon="md-chatboxes" onPress={goToPage} />
        <Tab index={3} icon="md-person" onPress={goToPage} />
      </View>
    );
  }
}
