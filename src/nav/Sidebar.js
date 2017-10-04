/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import DeviceInfo from 'react-native-device-info';

import type { Narrow } from '../types';
import boundActions from '../boundActions';
import MainTabs from '../main/MainTabs';
import { STATUSBAR_HEIGHT } from '../styles/platform';

const componentStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
});

class Sidebar extends PureComponent {
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
      paddingTop: DeviceInfo.getSystemVersion() >= 11 ? safeAreaInsets.top : STATUSBAR_HEIGHT,
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

export default connect(
  state => ({
    safeAreaInsets: state.app.safeAreaInsets,
  }),
  boundActions,
)(Sidebar);
