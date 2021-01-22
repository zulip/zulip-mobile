/* @flow strict-local */

import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { MainTabsNavigationProp, MainTabsRouteProp } from './MainTabsScreen';
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
  route: MainTabsRouteProp<'home'>,

  dispatch: Dispatch,
|}>;

class HomeScreen extends PureComponent<Props> {
  render() {
    const { dispatch } = this.props;

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
        <LoadingBanner />
        <UnreadCards />
      </View>
    );
  }
}

export default connect<{||}, _, _>()(HomeScreen);
