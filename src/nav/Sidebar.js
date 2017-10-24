/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Actions, Dimensions, Narrow } from '../types';
import connectWithActions from '../connectWithActions';
import MainTabs from '../main/MainTabs';
import { NULL_SAFE_AREA_INSETS } from '../nullObjects';

const componentStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
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
    const { safeAreaInsets } = this.props;
    const paddingStyles = {
      paddingTop: (safeAreaInsets || NULL_SAFE_AREA_INSETS).top,
      paddingBottom: (safeAreaInsets || NULL_SAFE_AREA_INSETS).bottom,
    };

    return (
      <View style={[componentStyles.container, paddingStyles, styles.background]}>
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
  safeAreaInsets: state.device.safeAreaInsets,
}))(Sidebar);
