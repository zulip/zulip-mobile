/* @flow */
import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';

import { STATUSBAR_HEIGHT } from '../styles';
import type { OnNarrowAction, PushRouteAction, } from '../types';
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
  }
});

type Props = {
  ownEmail: string,
  realm: string,
  users: any[],
  narrow: () => void,
  presence: Object,
  onNarrow: OnNarrowAction,
  pushRoute: PushRouteAction,
  conversations: string[],
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
  }

  handleUserNarrow = (email: string) =>
    this.props.onNarrow(
      email.indexOf(',') === -1 ?
        privateNarrow(email) :
        groupNarrow(email.split(','))
    );

  handleSearchPress = () => {
    this.props.pushRoute('users');
  }

  render() {
    const { conversations, realm, users, narrow } = this.props;

    return (
      <View tabLabel="People" style={styles.container}>
        <ZulipButton
          secondary
          style={styles.button}
          text="Search people"
          onPress={this.handleSearchPress}
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
