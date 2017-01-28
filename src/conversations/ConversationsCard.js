import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';

import { STATUSBAR_HEIGHT } from '../common/platform';
import { privateNarrow, groupNarrow } from '../utils/narrow';
import { ZButton } from '../common';
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
};

export default class ConversationsCard extends Component {

  props: Props;

  state = {
    filter: '',
    onNarrow: () => {},
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
    const { pushRoute, onNarrow } = this.props;
    onNarrow();
    pushRoute('users');
  }

  render() {
    const { conversations, realm, users, narrow } = this.props;

    return (
      <View tabLabel="People" style={styles.container}>
        <ZButton
          secondary
          customStyles={styles.button}
          text="Search People"
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
