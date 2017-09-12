/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import type { Actions, Narrow } from '../types';
import { STATUSBAR_HEIGHT } from '../styles/platform';
import boundActions from '../boundActions';
import { homeNarrow, specialNarrow, allPrivateNarrow } from '../utils/narrow';
import NavButton from './NavButton';
import MainTabs from '../main/MainTabs';

const componentStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    paddingTop: STATUSBAR_HEIGHT,
  },
  iconList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

class StreamSidebar extends PureComponent {
  static contextTypes = {
    styles: () => null,
  };

  props: {
    actions: Actions,
    navigation: Object,
  };

  closeDrawer = () => {
    const { navigation } = this.props;
    navigation.navigate('DrawerClose');
  };

  narrowAndClose = (narrow: Narrow) => {
    const { actions } = this.props;
    this.closeDrawer();
    setTimeout(() => actions.doNarrow(narrow), 200);
  };

  navigateAndClose = (screen: string) => {
    const { actions } = this.props;
    switch (screen) {
      case 'search':
        actions.navigateToSearch();
        break;
      case 'settings':
        actions.navigateToSettings();
        break;
      default:
    }
    this.closeDrawer();
  };

  render() {
    const { styles } = this.context;

    return (
      <View style={[componentStyles.container, styles.background]} scrollsToTop={false}>
        <View style={componentStyles.iconList}>
          <NavButton name="md-home" onPress={() => this.narrowAndClose(homeNarrow)} />
          <NavButton name="md-mail" onPress={() => this.narrowAndClose(allPrivateNarrow)} />
          <NavButton name="md-star" onPress={() => this.narrowAndClose(specialNarrow('starred'))} />
          <NavButton name="md-at" onPress={() => this.narrowAndClose(specialNarrow('mentioned'))} />
          <NavButton name="md-search" onPress={() => this.navigateAndClose('search')} />
        </View>
        <MainTabs screenProps={{ onNarrow: this.closeDrawer }} />
      </View>
    );
  }
}

export default connect(null, boundActions)(StreamSidebar);
