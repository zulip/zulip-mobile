/* @flow strict-local */

import React, { useContext } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import type { RouteProp } from '../react-navigation';
import type { MainTabsNavigationProp } from '../main/MainTabsScreen';
import { ThemeContext, createStyleSheet } from '../styles';
import { useSelector } from '../react-redux';
import ZulipTextIntl from '../common/ZulipTextIntl';
import ZulipButton from '../common/ZulipButton';
import LoadingBanner from '../common/LoadingBanner';
import { IconPeople, IconPerson } from '../common/Icons';
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
export default function PmConversationsScreen(props: Props): Node {
  const { navigation } = props;
  const conversations = useSelector(getRecentConversations);
  const context = useContext(ThemeContext);

  return (
    <View style={[styles.container, { backgroundColor: context.backgroundColor }]}>
      <View style={styles.row}>
        <ZulipButton
          secondary
          Icon={IconPerson}
          style={styles.button}
          text="New PM"
          onPress={() => {
            setTimeout(() => navigation.dispatch(navigateToUsersScreen()));
          }}
        />
        <ZulipButton
          secondary
          Icon={IconPeople}
          style={styles.button}
          text="New group PM"
          onPress={() => {
            setTimeout(() => navigation.dispatch(navigateToCreateGroup()));
          }}
        />
      </View>
      <LoadingBanner />
      {conversations.length === 0 ? (
        <ZulipTextIntl style={styles.emptySlate} text="No recent conversations" />
      ) : (
        <PmConversationList conversations={conversations} />
      )}
    </View>
  );
}
