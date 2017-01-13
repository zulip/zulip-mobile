import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';

import { getInitialRoutes } from '../nav/routingSelectors';
import { STATUSBAR_HEIGHT } from '../common/platform';
import { BRAND_COLOR } from '../common/styles';
import { privateNarrow } from '../utils/narrow';
import { SearchInput } from '../common';
import ConversationList from './ConversationList';
import UserList from './UserList';
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
  statusbar: {
    height: STATUSBAR_HEIGHT,
    backgroundColor: BRAND_COLOR,
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

export default class UserListCard extends Component {

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

  handleFilterChange = (newFilter: string) => {
    this.setState({
      filter: newFilter,
    });
  }

  handleUserNarrow = (email: string) =>
    this.props.onNarrow(privateNarrow(email));

  render() {
    const { conversations, ownEmail, realm, users, presence } = this.props;
    const { filter } = this.state;

    return (
      <View tabLabel="People" style={styles.container}>
        <SearchInput onChange={this.handleFilterChange} />
        <ConversationList
          conversations={conversations}
          realm={realm}
          users={users}
          onNarrow={this.handleUserNarrow}
        />
        <UserList
          ownEmail={ownEmail}
          users={users}
          presence={presence}
          filter={filter}
          realm={realm}
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
