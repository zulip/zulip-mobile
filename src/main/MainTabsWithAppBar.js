/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Context, Dispatch } from '../types';
import NavButton from '../nav/NavButton';
import { Label } from '../common';
import { navigateToSearch } from '../actions';
import MainTabs from './MainTabs';

type Props = {
  dispatch: Dispatch,
  navigation: Object,
};

class MainTabsWithAppBar extends PureComponent<Props> {
  context: Context;
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles } = this.context;
    const { dispatch, navigation } = this.props;

    return (
      <View style={styles.flexed}>
        <View style={styles.navBar}>
          <NavButton
            name="menu"
            onPress={() => {
              navigation.navigate('DrawerOpen');
            }}
          />
          <Label
            text="Zulip"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[styles.flexed, styles.navTitle]}
          />
          <NavButton
            name="search"
            onPress={() => {
              dispatch(navigateToSearch());
            }}
          />
        </View>
        <MainTabs />
      </View>
    );
  }
}

export default connect()(MainTabsWithAppBar);
