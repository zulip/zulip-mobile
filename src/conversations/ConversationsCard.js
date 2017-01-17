import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';

import { getInitialRoutes } from '../nav/routingSelectors';
import { STATUSBAR_HEIGHT } from '../common/platform';
import { privateNarrow, groupNarrow } from '../utils/narrow';
import { Button } from '../common';
import ConversationList from './ConversationList';
import SwitchAccountButton from '../account-info/SwitchAccountButton';
import LogoutButton from '../account-info/LogoutButton';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
    borderColor: 'gray',
    marginTop: STATUSBAR_HEIGHT,
  },
  accountButtons: {
    paddingLeft: 8,
    paddingRight: 8,
    flexDirection: 'row',
  }
});

type Props = {
  ownEmail: string,
  realm: string,
  users: any[],
  narrow: () => void,
  presence: Object,
};

export default class ConversationListCard extends Component {

  props: Props;

  state = {
    filter: '',
    onNarrow: () => {},
  };

  static contextTypes = {
    drawer: () => null,
  };

  logout = () => {
    this.props.logout(this.props.accounts);
    this.props.initRoutes(getInitialRoutes(this.props.accounts));
  }

  handleUserNarrow = (email: string) =>
    this.props.onNarrow(
      email.indexOf(',') === -1 ?
        privateNarrow(email) :
        groupNarrow(email.split(','))
    );

  handleSearchPress = () => {
    const { pushRoute, onNarrow } = this.props;
    onNarrow();
    pushRoute('users');
  }

  render() {
    const { conversations, realm, users } = this.props;

    return (
      <View tabLabel="People" style={styles.container}>
        <Button
          text="Search"
          onPress={this.handleSearchPress}
        />
        <ConversationList
          conversations={conversations}
          realm={realm}
          users={users}
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
