/* @flow strict-local */

import React from 'react';
import { View } from 'react-native';

import type { RouteProp } from '../react-navigation';
import type { MainTabsNavigationProp } from './MainTabsScreen';
import * as NavigationService from '../nav/NavigationService';
import { useDispatch } from '../react-redux';
import { HOME_NARROW, MENTIONED_NARROW, STARRED_NARROW } from '../utils/narrow';
import NavButton from '../nav/NavButton';
import NavButtonGeneral from '../nav/NavButtonGeneral';
import UnreadCards from '../unread/UnreadCards';
import { doNarrow, navigateToSearch } from '../actions';
import IconUnreadMentions from '../nav/IconUnreadMentions';
import { BRAND_COLOR, createStyleSheet } from '../styles';
import { LoadingBanner } from '../common';
import ServerCompatBanner from '../common/ServerCompatBanner';

const styles = createStyleSheet({
  wrapper: {
    flex: 1,
    flexDirection: 'column',
  },
  iconList: {
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
});

type Props = $ReadOnly<{|
  navigation: MainTabsNavigationProp<'home'>,
  route: RouteProp<'home', void>,
|}>;

export default function HomeScreen(props: Props) {
  const dispatch = useDispatch();

  return (
    <View style={styles.wrapper}>
      <View style={styles.iconList}>
        <NavButton
          name="globe"
          onPress={() => {
            dispatch(doNarrow(HOME_NARROW));
          }}
        />
        <NavButton
          name="star"
          onPress={() => {
            dispatch(doNarrow(STARRED_NARROW));
          }}
        />
        <NavButtonGeneral
          onPress={() => {
            dispatch(doNarrow(MENTIONED_NARROW));
          }}
        >
          <IconUnreadMentions color={BRAND_COLOR} />
        </NavButtonGeneral>
        <NavButton
          name="search"
          onPress={() => {
            NavigationService.dispatch(navigateToSearch());
          }}
        />
      </View>
      <ServerCompatBanner />
      <LoadingBanner />
      <UnreadCards />
    </View>
  );
}
