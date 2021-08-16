/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { Node, ComponentType } from 'react';
import { View } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import * as NavigationService from '../nav/NavigationService';
import * as logging from '../utils/logging';
import ReactionUserList from './ReactionUserList';
import { connect } from '../react-redux';
import type { Dispatch, EmojiType, Message, ReactionType, UserId } from '../types';
import { Screen, Label, RawLabel } from '../common';
import { getOwnUserId } from '../selectors';
import aggregateReactions from './aggregateReactions';
import styles from '../styles';
import { materialTopTabNavigatorConfig } from '../styles/tabs';
import Emoji from '../emoji/Emoji';
import { navigateBack } from '../nav/navActions';

const Tab = createMaterialTopTabNavigator();

const emojiTypeFromReactionType = (reactionType: ReactionType): EmojiType => {
  if (reactionType === 'unicode_emoji') {
    return 'unicode';
  }
  return 'image';
};

type OuterProps = $ReadOnly<{|
  // These should be passed from React Navigation
  navigation: AppNavigationProp<'message-reactions'>,
  route: RouteProp<'message-reactions', {| reactionName?: string, messageId: number |}>,
|}>;

type SelectorProps = $ReadOnly<{|
  message: Message | void,
  ownUserId: UserId,
|}>;

type Props = $ReadOnly<{|
  ...OuterProps,

  // from `connect`
  dispatch: Dispatch,
  ...SelectorProps,
|}>;

/**
 * A screen showing who made what reaction on a given message.
 *
 * The `reactionName` nav-prop controls what reaction is focused when the
 * screen first appears.
 */
class MessageReactionsScreenInner extends PureComponent<Props> {
  componentDidMount() {
    if (this.props.message === undefined) {
      const { messageId } = this.props.route.params;
      logging.warn(
        'MessageReactionsScreen unexpectedly created without props.message; '
          + 'message with messageId is missing in state.messages',
        { messageId },
      );
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.message !== undefined && this.props.message === undefined) {
      // The message was present, but got purged (currently only caused by a
      // REGISTER_COMPLETE following a dead event queue), so go back.
      NavigationService.dispatch(navigateBack());
    }
  }

  render() {
    const { message, route, ownUserId } = this.props;
    const { reactionName } = route.params;

    const content: Node = (() => {
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

        return (
          <View style={styles.flexed}>
            <Tab.Navigator
              backBehavior="none"
              // The user may have originally navigated here to look at a reaction
              // that's since been removed.  Ignore the nav hint in that case.
              initialRouteName={
                aggregatedReactions.some(aR => aR.name === reactionName) ? reactionName : undefined
              }
              {...materialTopTabNavigatorConfig({
                showLabel: true,
                showIcon: false,
                style: {
                  borderWidth: 0.15,
                },
              })}
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
                        <RawLabel style={styles.paddingLeft} text={`${aggregatedReaction.count}`} />
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
}

const MessageReactionsScreen: ComponentType<OuterProps> = connect<SelectorProps, _, _>(
  (state, props) => ({
    // message *can* be undefined; see componentDidUpdate for explanation and handling.
    message: state.messages.get(props.route.params.messageId),
    ownUserId: getOwnUserId(state),
  }),
)(MessageReactionsScreenInner);

export default MessageReactionsScreen;
