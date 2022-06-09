/* @flow strict-local */
import React, { useEffect } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import * as NavigationService from '../nav/NavigationService';
import * as logging from '../utils/logging';
import ReactionUserList from './ReactionUserList';
import { useSelector } from '../react-redux';
import Screen from '../common/Screen';
import ZulipTextIntl from '../common/ZulipTextIntl';
import ZulipText from '../common/ZulipText';
import { getOwnUserId } from '../selectors';
import aggregateReactions from './aggregateReactions';
import styles from '../styles';
import { materialTopTabNavigatorConfig } from '../styles/tabs';
import Emoji from '../emoji/Emoji';
import { emojiTypeFromReactionType } from '../emoji/data';
import { navigateBack } from '../nav/navActions';
import { usePrevious } from '../reactUtils';

// The tab navigator we make here has a dynamic set of route names, but they
// all take `void` for parameters.
type NavParamList = {| +[name: string]: void |};

const Tab = createMaterialTopTabNavigator<NavParamList>();

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'message-reactions'>,
  route: RouteProp<'message-reactions', {| reactionName?: string, messageId: number |}>,
|}>;

/**
 * A screen showing who made what reaction on a given message.
 *
 * The `reactionName` nav-prop controls what reaction is focused when the
 * screen first appears.
 */
export default function MessageReactionsScreen(props: Props): Node {
  const { messageId, reactionName } = props.route.params;
  const message = useSelector(state => state.messages.get(messageId));
  const ownUserId = useSelector(getOwnUserId);

  useEffect(() => {
    if (message === undefined) {
      logging.warn(
        'MessageReactionsScreen unexpectedly created without props.message; '
          + 'message with messageId is missing in state.messages',
        { messageId },
      );
    }
  }, [message, messageId]);

  const prevMessage = usePrevious(message);
  useEffect(() => {
    if (prevMessage !== undefined && message === undefined) {
      // The message was present, but got purged (currently only caused by a
      // REGISTER_COMPLETE following a dead event queue), so go back.
      NavigationService.dispatch(navigateBack());
    }
  }, [prevMessage, message]);

  const content: Node = (() => {
    if (message === undefined) {
      return <View style={styles.flexed} />;
    } else if (message.reactions.length === 0) {
      return (
        <View style={[styles.flexed, styles.center]}>
          <ZulipTextIntl style={styles.largerText} text="No reactions" />
        </View>
      );
    } else {
      const aggregatedReactions = aggregateReactions(message.reactions, ownUserId);

      return (
        <View style={styles.flexed}>
          <Tab.Navigator
            backBehavior="none"
            // The user may have originally navigated here to look at a reaction
            // that's since been removed.  Ignore the nav hint in that case.
            initialRouteName={
              aggregatedReactions.some(aR => aR.name === reactionName) ? reactionName : undefined
            }
            {...materialTopTabNavigatorConfig()}
            swipeEnabled
          >
            {
              // Generate tabs for the reaction list. The tabs depend
              // on the distinct reactions on the message.
            }
            {aggregatedReactions.map(aggregatedReaction => (
              // Each tab corresponds to an aggregated reaction, and has a user list.
              <Tab.Screen
                key={aggregatedReaction.name}
                name={aggregatedReaction.name}
                component={() => <ReactionUserList reactedUserIds={aggregatedReaction.users} />}
                options={{
                  tabBarLabel: () => (
                    <View style={styles.row}>
                      <Emoji
                        code={aggregatedReaction.code}
                        type={emojiTypeFromReactionType(aggregatedReaction.type)}
                      />
                      <ZulipText style={styles.paddingLeft} text={`${aggregatedReaction.count}`} />
                    </View>
                  ),
                }}
              />
            ))}
          </Tab.Navigator>
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
