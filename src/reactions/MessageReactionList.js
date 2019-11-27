/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { createMaterialTopTabNavigator } from 'react-navigation';
import type { NavigationScreenProp } from 'react-navigation';

import ReactionUserList from './ReactionUserList';
import { connect } from '../react-redux';
import type { AggregatedReaction, Dispatch, Message, UserOrBot } from '../types';
import { Screen, Label, RawLabel } from '../common';
import { getOwnUser } from '../selectors';
import aggregateReactions from './aggregateReactions';
import styles from '../styles';
import { getAllUsersById } from '../users/userSelectors';
import tabsOptions from '../styles/tabs';
import Emoji from '../emoji/Emoji';
import { objectFromEntries } from '../jsBackport';

// Generate tabs for the reaction list.  The tabs depend on the distinct
// reactions on the message.
const getReactionsTabs = (
  aggregatedReactions: $ReadOnlyArray<AggregatedReaction>,
  allUsersById: Map<number, UserOrBot>,
) => {
  // Each tab corresponds to an aggregated reaction, and has a user list.
  const reactionsTabs = objectFromEntries(
    aggregatedReactions.map(aggregatedReaction => [
      aggregatedReaction.name,
      {
        screen: () => (
          <ReactionUserList reactedUserIds={aggregatedReaction.users} allUsersById={allUsersById} />
        ),
        navigationOptions: {
          tabBarLabel: () => (
            <View style={styles.row}>
              <Emoji name={aggregatedReaction.name} />
              <RawLabel style={styles.paddingLeft} text={`${aggregatedReaction.count}`} />
            </View>
          ),
        },
      },
    ]),
  );

  return createMaterialTopTabNavigator(reactionsTabs, {
    backBehavior: 'none',
    ...tabsOptions({
      showLabel: true,
      showIcon: false,
      style: {
        borderWidth: 0.15,
      },
    }),
  });
};

type SelectorProps = $ReadOnly<{|
  message: Message,
  ownUserId: number,
  allUsersById: Map<number, UserOrBot>,
|}>;

type Props = $ReadOnly<{|
  navigation: NavigationScreenProp<{ params: {| messageId: number |} }>,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

class MessageReactionList extends PureComponent<Props> {
  render() {
    const { message, ownUserId, allUsersById } = this.props;
    const { reactions } = message;

    // useful when user is on this screen and reactions are revoked
    if (reactions.length === 0) {
      return (
        <Screen title="Reactions" scrollEnabled={false}>
          <View style={[styles.flexed, styles.center]}>
            <Label style={styles.largerText} text="No reactions" />
          </View>
        </Screen>
      );
    }

    const aggregatedReactions = aggregateReactions(reactions, ownUserId);

    const TabView = getReactionsTabs(aggregatedReactions, allUsersById);

    return (
      <Screen title="Reactions" scrollEnabled={false}>
        <View style={styles.flexed}>
          <TabView />
        </View>
      </Screen>
    );
  }
}

export default connect((state, props): SelectorProps => ({
  message: state.messages[props.navigation.state.params.messageId],
  ownUserId: getOwnUser(state).user_id,
  allUsersById: getAllUsersById(state),
}))(MessageReactionList);
