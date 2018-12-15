/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';

import type { Context, Dispatch, GlobalState, PmConversationData, PresenceState } from '../types';
import { LoadingIndicator, ZulipButton, SearchEmptyState } from '../common';
import { IconPeople, IconSearch } from '../common/Icons';
import PmConversationList from './PmConversationList';
import { getLoading, getPresence, getRecentConversations, getAllUsersByEmail } from '../selectors';
import { navigateToCreateGroup, navigateToUsersScreen } from '../actions';

const componentStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    margin: 8,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
});

type Props = {|
  dispatch: Dispatch,
  conversations: PmConversationData[],
  isLoading: boolean,
  presences: PresenceState,
  usersByEmail: Object,
|};

/**
 * The "PMs" page in the main tabs navigation.
 * */
class PmConversationsCard extends PureComponent<Props> {
  context: Context;

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
              setTimeout(() => dispatch(navigateToCreateGroup()));
            }}
          />
          <ZulipButton
            secondary
            Icon={IconSearch}
            style={componentStyles.button}
            text="Search"
            onPress={() => {
              setTimeout(() => dispatch(navigateToUsersScreen()));
            }}
          />
        </View>
        {conversations.length === 0 ? (
          <SearchEmptyState text="No recent conversations" />
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

export default connect((state: GlobalState) => ({
  conversations: getRecentConversations(state),
  isLoading: getLoading(state).users,
  presences: getPresence(state),
  usersByEmail: getAllUsersByEmail(state),
}))(PmConversationsCard);
