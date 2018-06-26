/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';

import type { Context, Dispatch, PmConversationData, PresenceState } from '../types';
import { Label, LoadingIndicator, ZulipButton } from '../common';
import { IconPeople, IconSearch } from '../common/Icons';
import PmConversationList from './PmConversationList';
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
  dispatch: Dispatch,
  conversations: PmConversationData[],
  isLoading: boolean,
  presences: PresenceState,
  usersByEmail: Object,
};

/**
 * The "PMs" page in the main tabs navigation.
 * */
class PmConversationsCard extends PureComponent<Props> {
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
          <Label style={componentStyles.emptySlate} text="No recent conversations" />
        ) : (
          <PmConversationList
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
}))(PmConversationsCard);
