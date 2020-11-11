/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createMaterialTopTabNavigator } from 'react-navigation-tabs';

import type { AppNavigationProp } from '../nav/AppNavigator';
import * as NavigationService from '../nav/NavigationService';
import * as logging from '../utils/logging';
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
import { materialTopTabNavigatorConfig } from '../styles/tabs';
import Emoji from '../emoji/Emoji';
import { objectFromEntries } from '../jsBackport';
import { navigateBack } from '../nav/navActions';

const emojiTypeFromReactionType = (reactionType: ReactionType): EmojiType => {
  if (reactionType === 'unicode_emoji') {
    return 'unicode';
  }
  return 'image';
};

/**
 * Get the route config for a single aggregated reaction.
 */
const getRouteConfig = (
  aggregatedReaction: AggregatedReaction,
  allUsersById: Map<number, UserOrBot>,
) => ({
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
});

/**
 * Generate route config for the reaction-tabs navigator.
 *
 * There is a tab, with a user list, for each of the message's
 * distinct reactions.
 */
const getReactionTabsRoutes = (
  aggregatedReactions: $ReadOnlyArray<AggregatedReaction>,
  allUsersById: Map<number, UserOrBot>,
) =>
  objectFromEntries(
    aggregatedReactions.map(aggregatedReaction => [
      aggregatedReaction.name,
      getRouteConfig(aggregatedReaction, allUsersById),
    ]),
  );

/**
 * Generate tab-navigator config for the reaction-tabs navigator.
 */
const getReactionTabsNavConfig = (
  aggregatedReactions: $ReadOnlyArray<AggregatedReaction>,
  reactionName?: string,
) => ({
  backBehavior: 'none',

  // The user may have originally navigated here to look at a reaction
  // that's since been removed.  Ignore the nav hint in that case.
  initialRouteName: aggregatedReactions.some(aR => aR.name === reactionName)
    ? reactionName
    : undefined,

  ...materialTopTabNavigatorConfig({
    showLabel: true,
    showIcon: false,
    style: {
      borderWidth: 0.15,
    },
  }),
  swipeEnabled: true,
});

type SelectorProps = $ReadOnly<{|
  message: Message | void,
  ownUserId: number,
  allUsersById: Map<number, UserOrBot>,
|}>;

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'message-reactions'>,

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
  componentDidMount() {
    if (this.props.message === undefined) {
      const { messageId } = this.props.navigation.state.params;
      logging.warn(
        'MessageReactionList unexpectedly created without props.message; '
          + 'message with messageId is missing in state.messages',
        { messageId },
      );
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.message !== undefined && this.props.message === undefined) {
      // The message was present, but got purged (currently only caused by a
      // REALM_INIT following a dead event queue), so go back.
      NavigationService.dispatch(navigateBack());
    }
  }

  render() {
    const { message, navigation, ownUserId, allUsersById } = this.props;
    const { reactionName } = navigation.state.params;

    const content: React$Node = (() => {
      if (message === undefined) {
        return <View style={styles.flexed} />;
      } else if (message.reactions.length === 0) {
        return (
          <View style={[styles.flexed, styles.center]}>
            <Label style={styles.largerText} text="No reactions" />
          </View>
        );
      } else {
        const aggregatedReactions = aggregateReactions(message.reactions, ownUserId);
        // TODO: React Navigation doesn't want us to explicitly render
        // more than one navigator in the app, and the recommended
        // workaround isn't feasible; see discussion at
        // https://chat.zulip.org/#narrow/stream/243-mobile-team/topic/Dynamic.20routes.20in.20react-navigation/near/1008268.
        // Given that, it seems we can use `createAppContainer` so our
        // violation of the "only explicitly render one navigator"
        // rule doesn't cause a crashing error. But the name
        // `createAppContainer` is enough to suggest that we're
        // definitely doing something wrong here.
        const TabView = createAppContainer(
          createMaterialTopTabNavigator(
            getReactionTabsRoutes(aggregatedReactions, allUsersById),
            getReactionTabsNavConfig(aggregatedReactions, reactionName),
          ),
        );

        return (
          <View style={styles.flexed}>
            <TabView />
          </View>
        );
      }
    })();

    return (
      <Screen title="Reactions" scrollEnabled={false}>
        {content}
      </Screen>
    );
  }
}

export default connect<SelectorProps, _, _>((state, props) => ({
  // message *can* be undefined; see componentDidUpdate for explanation and handling.
  message: (state.messages[props.navigation.state.params.messageId]: Message | void),
  ownUserId: getOwnUser(state).user_id,
  allUsersById: getAllUsersById(state),
}))(MessageReactionList);
