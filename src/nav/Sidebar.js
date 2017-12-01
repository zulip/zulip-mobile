/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { homeNarrow, specialNarrow, allPrivateNarrow } from '../utils/narrow';
import NavButton from './NavButton';
import type { Actions, Dimensions, Narrow } from '../types';
import connectWithActions from '../connectWithActions';
import MainTabs from '../main/MainTabs';

const componentStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  iconList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

type Props = {
  actions: Actions,
  navigation: any,
  safeAreaInsets: Dimensions,
};

class Sidebar extends PureComponent<Props> {
  static contextTypes = {
    styles: () => null,
  };

  doNarrowCloseDrawer = (narrow: Narrow) => {
    const { actions, navigation } = this.props;
    navigation.navigate('DrawerClose');
    setTimeout(() => actions.doNarrow(narrow), 0);
  };

  closeDrawer = () => {
    const { navigation } = this.props;
    navigation.navigate('DrawerClose');
  };

  render() {
    const { styles } = this.context;
    const { safeAreaInsets, actions } = this.props;
    const paddingStyles = {
      paddingTop: safeAreaInsets.top,
      paddingBottom: safeAreaInsets.bottom,
    };

    return (
      <View style={[componentStyles.container, paddingStyles, styles.background]}>
        <View style={componentStyles.iconList}>
          <NavButton name="home" onPress={() => this.doNarrowCloseDrawer(homeNarrow)} />
          <NavButton name="mail" onPress={() => this.doNarrowCloseDrawer(allPrivateNarrow)} />
          <NavButton
            name="star"
            onPress={() => this.doNarrowCloseDrawer(specialNarrow('starred'))}
          />
          <NavButton
            name="at-sign"
            onPress={() => this.doNarrowCloseDrawer(specialNarrow('mentioned'))}
          />
          <NavButton name="search" onPress={actions.navigateToSearch} />
        </View>
        <MainTabs
          screenProps={{
            doNarrowCloseDrawer: this.doNarrowCloseDrawer,
            closeDrawer: this.closeDrawer,
          }}
        />
      </View>
    );
  }
}

export default connectWithActions(state => ({
  safeAreaInsets: state.app.safeAreaInsets,
}))(Sidebar);
