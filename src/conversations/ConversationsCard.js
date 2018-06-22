/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';

import type { Context, Dispatch, PresenceState } from '../types';
import { Label, LoadingIndicator, ZulipButton } from '../common';
import { IconPeople, IconSearch } from '../common/Icons';
import ConversationList from './ConversationList';
import {
  getLoading,
  getPresence,
  getRecentConversations,
  getAllUsersAndBotsByEmail,
} from '../selectors';
import { navigateToCreateGroup, navigateToUsersScreen } from '../actions';

const componentStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    margin: 8,
    flex: 1,
  },
  emptySlate: {
    textAlign: 'center',
    fontSize: 18,
  },
  row: {
    flexDirection: 'row',
  },
});

type Props = {
  dispatch: Dispatch,
  conversations: Object[],
  isLoading: boolean,
  presences: PresenceState,
  usersByEmail: Object,
};

class ConversationsCard extends PureComponent<Props> {
  context: Context;
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles } = this.context;
    const { dispatch, conversations, isLoading, presences, usersByEmail } = this.props;

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
            onPress={() => {
              dispatch(navigateToCreateGroup());
            }}
          />
          <ZulipButton
            secondary
            Icon={IconSearch}
            style={componentStyles.button}
            text="Search"
            onPress={() => {
              dispatch(navigateToUsersScreen());
            }}
          />
        </View>
        {conversations.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Label style={componentStyles.emptySlate} text="No recent conversations" />
          </View>
        ) : (
          <ConversationList
            dispatch={dispatch}
            conversations={conversations}
            presences={presences}
            usersByEmail={usersByEmail}
          />
        )}
      </View>
    );
  }
}

export default connect(state => ({
  conversations: getRecentConversations(state),
  isLoading: getLoading(state).users,
  presences: getPresence(state),
  usersByEmail: getAllUsersAndBotsByEmail(state),
}))(ConversationsCard);
