/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { View, Text, Dimensions } from 'react-native';

import type { RouteProp } from '../react-navigation';
import type { MainTabsNavigationProp } from './MainTabsScreen';
import * as NavigationService from '../nav/NavigationService';
import { useDispatch } from '../react-redux';
import UnreadCards from '../unread/UnreadCards';
import { BRAND_COLOR, createStyleSheet } from '../styles';
import { LoadingBanner } from '../common';
import ServerCompatBanner from '../common/ServerCompatBanner';
import EvilIcons from 'react-native-vector-icons/EvilIcons'

const styles = createStyleSheet({
  wrapper: {
    flex: 1,
    flexDirection: 'column',
  },
  iconList: {
    justifyContent: 'center',
    height: 45,
    alignItems: 'center',
  },
  zulipAppText: {
    fontSize: 22,
    color: BRAND_COLOR,
    alignSelf: 'center',
  },
  drawerIcon: {
    position: 'absolute',
    left: 10
  }
});

type Props = $ReadOnly<{|
  navigation: MainTabsNavigationProp < 'home' >,
    route: RouteProp < 'home', void>,
|}>;

export default function HomeScreen(props: Props): Node {
  const dispatch = useDispatch();

  return (
    <View style={styles.wrapper}>
      <View style={styles.iconList}>
        <EvilIcons
          name='navicon'
          size={32}
          onPress={() => props.navigation.openDrawer()}
          style={styles.drawerIcon}
        />
        <Text style={styles.zulipAppText}>Zulip</Text>
      </View>
      <ServerCompatBanner />
      <LoadingBanner />
      <UnreadCards />
    </View>
  );
}
