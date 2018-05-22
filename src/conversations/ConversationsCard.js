/* @flow */
import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';

import type { Actions, Context, PresenceState } from '../types';
import { Label, LoadingIndicator, ZulipButton } from '../common';
import { IconPeople, IconSearch } from '../common/Icons';
import ConversationList from './ConversationList';

const componentStyles = StyleSheet.create({
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

type Props = {
  actions: Actions,
  conversations: Object[],
  isLoading: boolean,
  presences: PresenceState,
  usersByEmail: Object,
};

export default class ConversationsCard extends PureComponent<Props> {
  context: Context;
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles } = this.context;
    const { actions, conversations, isLoading, presences, usersByEmail } = this.props;

    if (isLoading) {
      return <LoadingIndicator size={40} />;
    }

    return (
      <View style={[componentStyles.container, styles.background]}>
        <View style={componentStyles.row}>
          <ZulipButton
            secondary
            Icon={IconPeople}
            style={componentStyles.button}
            text="Create group"
            onPress={actions.navigateToCreateGroup}
          />
          <ZulipButton
            secondary
            Icon={IconSearch}
            style={componentStyles.button}
            text="Search"
            onPress={actions.navigateToUsersScreen}
          />
        </View>
        {conversations.length === 0 ? (
          <Label style={componentStyles.emptySlate} text="No recent conversations" />
        ) : (
          <ConversationList
            actions={actions}
            conversations={conversations}
            presences={presences}
            usersByEmail={usersByEmail}
          />
        )}
      </View>
    );
  }
}
