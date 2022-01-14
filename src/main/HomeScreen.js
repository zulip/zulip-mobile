/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RouteProp } from '../react-navigation';
import type { MainTabsNavigationProp } from './MainTabsScreen';
import * as NavigationService from '../nav/NavigationService';
import { useDispatch } from '../react-redux';
import { HOME_NARROW, MENTIONED_NARROW, STARRED_NARROW } from '../utils/narrow';
import { TopTabButton, TopTabButtonGeneral } from '../nav/TopTabButton';
import UnreadCards from '../unread/UnreadCards';
import { doNarrow, navigateToSearch } from '../actions';
import IconUnreadMentions from '../nav/IconUnreadMentions';
import { BRAND_COLOR, createStyleSheet } from '../styles';
import { LoadingBanner } from '../common';
import ServerCompatBanner from '../common/ServerCompatBanner';
import ServerPushSetupBanner from '../common/ServerPushSetupBanner';

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

export default function HomeScreen(props: Props): Node {
  const dispatch = useDispatch();

  return (
    <SafeAreaView mode="padding" edges={['top']} style={styles.wrapper}>
      <View style={styles.iconList}>
        <TopTabButton
          name="globe"
          onPress={() => {
            dispatch(doNarrow(HOME_NARROW));
          }}
        />
        <TopTabButton
          name="star"
          onPress={() => {
            dispatch(doNarrow(STARRED_NARROW));
          }}
        />
        <TopTabButtonGeneral
          onPress={() => {
            dispatch(doNarrow(MENTIONED_NARROW));
          }}
        >
          <IconUnreadMentions color={BRAND_COLOR} />
        </TopTabButtonGeneral>
        <TopTabButton
          name="search"
          onPress={() => {
            NavigationService.dispatch(navigateToSearch());
          }}
        />
      </View>
      <ServerCompatBanner />
      <ServerPushSetupBanner />
      <LoadingBanner />
      <UnreadCards />
    </SafeAreaView>
  );
}
