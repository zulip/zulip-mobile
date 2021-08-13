/* @flow strict-local */

import React, { useContext } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RouteProp } from '../react-navigation';
import type { MainTabsNavigationProp } from '../main/MainTabsScreen';
import * as NavigationService from '../nav/NavigationService';
import { ThemeContext, createStyleSheet } from '../styles';
import { useSelector } from '../react-redux';
import { Label, ZulipButton, LoadingBanner } from '../common';
import { IconPeople, IconSearch } from '../common/Icons';
import PmConversationList from './PmConversationList';
import { getRecentConversations } from '../selectors';
import { navigateToCreateGroup, navigateToUsersScreen } from '../actions';

const styles = createStyleSheet({
  container: {
    flex: 1,
  },
  button: {
    margin: 8,
    flex: 1,
  },
  emptySlate: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 20,
  },
  row: {
    flexDirection: 'row',
  },
});

type Props = $ReadOnly<{|
  navigation: MainTabsNavigationProp<'pm-conversations'>,
  route: RouteProp<'pm-conversations', void>,
|}>;

/**
 * The "PMs" page in the main tabs navigation.
 *
 * Needs to occupy the horizontal insets because its descendents (the PM
 * conversation items) do.
 */
export default function PmConversationsScreen(props: Props): Node {
  const conversations = useSelector(getRecentConversations);
  const context = useContext(ThemeContext);

  return (
    <View style={[styles.container, { backgroundColor: context.backgroundColor }]}>
      <SafeAreaView mode="padding" edges={['right', 'left']} style={styles.row}>
        <ZulipButton
          secondary
          Icon={IconPeople}
          style={styles.button}
          text="Group PM"
          onPress={() => {
            setTimeout(() => NavigationService.dispatch(navigateToCreateGroup()));
          }}
        />
        <ZulipButton
          secondary
          Icon={IconSearch}
          style={styles.button}
          text="Search"
          onPress={() => {
            setTimeout(() => NavigationService.dispatch(navigateToUsersScreen()));
          }}
        />
      </SafeAreaView>
      <LoadingBanner />
      {conversations.length === 0 ? (
        <Label style={styles.emptySlate} text="No recent conversations" />
      ) : (
        <PmConversationList conversations={conversations} />
      )}
    </View>
  );
}
