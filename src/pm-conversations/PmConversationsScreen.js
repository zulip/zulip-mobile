/* @flow strict-local */

import React, { useContext } from 'react';
import { View } from 'react-native';

import type { RouteProp } from '../react-navigation';
import type { MainTabsNavigationProp } from '../main/MainTabsScreen';
import * as NavigationService from '../nav/NavigationService';
import { ThemeContext, createStyleSheet } from '../styles';
import { useSelector } from '../react-redux';
import { Label, ZulipButton, LoadingBar } from '../common';
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
 * */
export default function PmConversationsScreen(props: Props) {
  const conversations = useSelector(getRecentConversations);
  const context = useContext(ThemeContext);

  return (
    <View style={[styles.container, { backgroundColor: context.backgroundColor }]}>
      <View>
        <View style={styles.row}>
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
        </View>
        <LoadingBar
          viewStyle={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          }}
        />
      </View>
      {conversations.length === 0 ? (
        <Label style={styles.emptySlate} text="No recent conversations" />
      ) : (
        <PmConversationList conversations={conversations} />
      )}
    </View>
  );
}
