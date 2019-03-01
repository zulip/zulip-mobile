/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';

import type { Context, Dispatch, GlobalState, PmConversationData, UserOrBot } from '../types';
import { Label, LoadingIndicator, ZulipButton } from '../common';
import { IconPeople, IconSearch } from '../common/Icons';
import PmConversationList from './PmConversationList';
import { getLoading, getRecentConversations, getAllUsersByEmail } from '../selectors';
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

type Props = {|
  dispatch: Dispatch,
  conversations: PmConversationData[],
  isLoading: boolean,
  usersByEmail: Map<string, UserOrBot>,
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
    const { styles: contextStyles } = this.context;
    const { dispatch, conversations, isLoading, usersByEmail } = this.props;

    if (isLoading) {
      return <LoadingIndicator size={40} />;
    }

    return (
      <View style={[componentStyles.container, contextStyles.background]}>
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
          <Label style={componentStyles.emptySlate} text="No recent conversations" />
        ) : (
          <PmConversationList
            dispatch={dispatch}
            conversations={conversations}
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
  usersByEmail: getAllUsersByEmail(state),
}))(PmConversationsCard);
