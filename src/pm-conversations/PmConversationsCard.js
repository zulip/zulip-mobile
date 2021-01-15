/* @flow strict-local */

import React, { useContext } from 'react';
import { View } from 'react-native';

import type { MainTabsNavigationProp, MainTabsRouteProp } from '../main/MainTabs';
import * as NavigationService from '../nav/NavigationService';
import { ThemeContext, createStyleSheet } from '../styles';
import type { Dispatch, PmConversationData } from '../types';
import { connect } from '../react-redux';
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
  navigation: MainTabsNavigationProp<'conversations'>,
  route: MainTabsRouteProp<'conversations'>,

  dispatch: Dispatch,
  conversations: PmConversationData[],
|}>;

/**
 * The "PMs" page in the main tabs navigation.
 * */
function PmConversationsCard(props: Props) {
  const { dispatch, conversations } = props;
  const context = useContext(ThemeContext);

  return (
    <View style={[styles.container, { backgroundColor: context.backgroundColor }]}>
      <View style={styles.row}>
        <ZulipButton
          secondary
          Icon={IconPeople}
          style={styles.button}
          text="Create group"
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
      <LoadingBanner />
      {conversations.length === 0 ? (
        <Label style={styles.emptySlate} text="No recent conversations" />
      ) : (
        <PmConversationList dispatch={dispatch} conversations={conversations} />
      )}
    </View>
  );
}

export default connect(state => ({
  conversations: getRecentConversations(state),
}))(PmConversationsCard);
