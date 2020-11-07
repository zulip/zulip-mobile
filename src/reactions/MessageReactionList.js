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

  // It's not feasible to set up our newly created tab navigator as
  // part of the entire app's navigation (see the note at
  // `getReactionsTabs`'s call site). Given that, it seems we can use
  // `createAppContainer` so our violation of the "only explicitly
  // render one navigator" rule doesn't cause a crashing error. But
  // the name `createAppContainer` is enough to suggest that we're
  // definitely doing something wrong here.
  return createAppContainer(
    createMaterialTopTabNavigator(reactionsTabs, {
      backBehavior: 'none',

      // The user may have originally navigated here to look at a reaction
      // that's since been removed.  Ignore the nav hint in that case.
      //
      // The `Object.freeze` in the `:` case avoids an open Flow
      // issue:
      // https://github.com/facebook/flow/issues/2386#issuecomment-695064325
      ...(reactionName !== undefined && reactionsTabs[reactionName]
        ? { initialRouteName: reactionName }
        : Object.freeze({})),

      ...materialTopTabNavigatorConfig({
        showLabel: true,
        showIcon: false,
        style: {
          borderWidth: 0.15,
        },
      }),
      swipeEnabled: true,
    }),
  );
};

type SelectorProps = $ReadOnly<{|
  message: Message | void,
  ownUserId: number,
  allUsersById: Map<number, UserOrBot>,
|}>;

type Props = $ReadOnly<{|
  // Since we've put this screen in AppNavigator's route config, and
  // we don't invoke it without type-checking anywhere else (in fact,
  // we don't invoke it anywhere else at all), we know it gets the
  // `navigation` prop for free, with the particular shape for this
  // route.
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
        const TabView = getReactionsTabs(aggregatedReactions, reactionName, allUsersById);
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
