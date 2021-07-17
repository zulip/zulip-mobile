/* @flow strict-local */

import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RouteProp } from '../react-navigation';
import type { MainTabsNavigationProp } from './MainTabsScreen';
import * as NavigationService from '../nav/NavigationService';
import type { Dispatch } from '../types';
import { connect } from '../react-redux';
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

  dispatch: Dispatch,
|}>;

/**
 * The first tab in the main-tabs screen, showing unread counts.
 *
 * Needs to occupy the horizontal insets because its descendents (the
 * unread conversation items) do.
 */
class HomeScreen extends PureComponent<Props> {
  render() {
    const { dispatch } = this.props;

    return (
      <View style={styles.wrapper}>
        <SafeAreaView mode="margin" edges={['right', 'left']} style={styles.iconList}>
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
        </SafeAreaView>
        <ServerCompatBanner />
        <LoadingBanner />
        <UnreadCards />
      </View>
    );
  }
}

export default connect<{||}, _, _>()(HomeScreen);
