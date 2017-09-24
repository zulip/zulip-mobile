/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import type { Narrow } from '../types';
import boundActions from '../boundActions';
import { STATUSBAR_HEIGHT } from '../styles/platform';
import MainTabs from '../main/MainTabs';

const componentStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    paddingTop: STATUSBAR_HEIGHT,
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

    return (
      <View style={[componentStyles.container, styles.background]}>
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

export default connect(null, boundActions)(Sidebar);
