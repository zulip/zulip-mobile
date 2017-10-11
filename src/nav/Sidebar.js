/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Dimensions, Narrow } from '../types';
import connectWithActions from '../connectWithActions';
import MainTabs from '../main/MainTabs';

const componentStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
});

type Props = {
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
      paddingTop: safeAreaInsets.top,
      paddingBottom: safeAreaInsets.bottom,
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
  safeAreaInsets: state.app.safeAreaInsets,
}))(Sidebar);
