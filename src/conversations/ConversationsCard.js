/* @flow */
import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';

import { STATUSBAR_HEIGHT } from '../styles';
import type { Actions, Narrow } from '../types';
import { privateNarrow, groupNarrow } from '../utils/narrow';
import { ZulipButton } from '../common';
import ConversationList from './ConversationList';
import SwitchAccountButton from '../account-info/SwitchAccountButton';
import LogoutButton from '../account-info/LogoutButton';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    paddingTop: STATUSBAR_HEIGHT,
  },
  accountButtons: {
    flexDirection: 'row',
  },
  button: {
    margin: 8,
  },
});

type Props = {
  realm: string,
  narrow: Narrow,
  users: any[],
  actions: Actions,
  conversations: string[],
  onNarrow: () => void,
};

export default class ConversationsCard extends Component {
  props: Props;

  state = {
    filter: '',
  };

  handleFilterChange = (newFilter: string) => {
    this.setState({
      filter: newFilter,
    });
  };

  handleUserNarrow = (email: string) =>
    this.props.onNarrow(
      email.indexOf(',') === -1 ? privateNarrow(email) : groupNarrow(email.split(',')),
    );

  render() {
    const { actions, conversations, realm, users, narrow } = this.props;

    return (
      <View tabLabel="People" style={styles.container}>
        <ZulipButton
          secondary
          style={styles.button}
          text="Search people"
          onPress={actions.navigateToUsersScreen}
        />
        <ConversationList
          conversations={conversations}
          realm={realm}
          users={users}
          narrow={narrow}
          onNarrow={this.handleUserNarrow}
        />
        <View style={styles.accountButtons}>
          <SwitchAccountButton />
          <LogoutButton />
        </View>
      </View>
    );
  }
}
