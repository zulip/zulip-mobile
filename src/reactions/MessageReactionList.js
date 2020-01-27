/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { createMaterialTopTabNavigator } from 'react-navigation';
import type { NavigationScreenProp } from 'react-navigation';

import ReactionUserList from './ReactionUserList';
import { connect } from '../react-redux';
import type {
  AggregatedReaction,
  Dispatch,
  EmojiType,
  Message,
  ReactionType,
  UserOrBot,
} from '../types';
import { Screen, Label, RawLabel } from '../common';
import { getOwnUser } from '../selectors';
import aggregateReactions from './aggregateReactions';
import styles from '../styles';
import { getAllUsersById } from '../users/userSelectors';
import tabsOptions from '../styles/tabs';
import Emoji from '../emoji/Emoji';
import { objectFromEntries } from '../jsBackport';

const emojiTypeFromReactionType = (reactionType: ReactionType): EmojiType => {
  if (reactionType === 'unicode_emoji') {
    return 'unicode';
  }
  return 'image';
};

// Generate tabs for the reaction list.  The tabs depend on the distinct
// reactions on the message.
const getReactionsTabs = (
  aggregatedReactions: $ReadOnlyArray<AggregatedReaction>,
  reactionName?: string,
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
              <Emoji
                code={aggregatedReaction.code}
                type={emojiTypeFromReactionType(aggregatedReaction.type)}
              />
              <RawLabel style={styles.paddingLeft} text={`${aggregatedReaction.count}`} />
            </View>
          ),
        },
      },
    ]),
  );

  // prettier-ignore
  return createMaterialTopTabNavigator(reactionsTabs, {
    backBehavior: 'none',

    // The user may have originally navigated here to look at a reaction
    // that's since been removed.  Ignore the nav hint in that case.
    ...(reactionName !== undefined && reactionsTabs[reactionName]
      ? { initialRouteName: reactionName }
      : {}),

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
  navigation: NavigationScreenProp<{ params: {| reactionName?: string, messageId: number |} }>,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

/**
 * A screen showing who made what reaction on a given message.
 *
 * The `reactionName` nav-prop controls what reaction is focused when the
 * screen first appears.
 */
class MessageReactionList extends PureComponent<Props> {
  render() {
    const { message, navigation, ownUserId, allUsersById } = this.props;
    const { reactionName } = navigation.state.params;
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

    const TabView = getReactionsTabs(aggregatedReactions, reactionName, allUsersById);

    return (
      <Screen title="Reactions" scrollEnabled={false}>
        <View style={styles.flexed}>
          <TabView />
        </View>
      </Screen>
    );
  }
}

export default connect<SelectorProps, _, _>((state, props) => ({
  message: state.messages[props.navigation.state.params.messageId],
  ownUserId: getOwnUser(state).user_id,
  allUsersById: getAllUsersById(state),
}))(MessageReactionList);
