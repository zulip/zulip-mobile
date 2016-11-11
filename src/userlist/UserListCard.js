import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';

import { Button } from '../common';
import { STATUSBAR_HEIGHT, BRAND_COLOR } from '../common/styles';
import { privateNarrow } from '../lib/narrow';
import LogoutButton from './LogoutButton';
import UserFilter from './UserFilter';
import UserList from './UserList';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
    borderColor: 'grey',
  },
  statusbar: {
    height: STATUSBAR_HEIGHT,
    backgroundColor: BRAND_COLOR,
  },
});

type Props = {
  ownEmail: string,
  users: any[],
  narrow: () => void,
  presence: Object,
};

export default class UserListCard extends Component {

  props: Props;

  state: {
    filter: string,
  };

  static contextTypes = {
    drawer: () => null,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      filter: '',
    };
  }

  handleFilterChange = (newFilter: string) => {
    this.setState({
      filter: newFilter,
    });
  }

  handleUserNarrow = (email: string) => {
    this.props.narrow(
      privateNarrow([email]),
    );
    this.context.drawer.close();
  }

  switchAccount = () =>
    this.props.pushRoute({ key: 'accountlist' });

  render() {
    const { ownEmail, users, presence } = this.props;
    const { filter } = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.statusbar} />
        <UserFilter onChange={this.handleFilterChange} />
        <UserList
          ownEmail={ownEmail}
          users={users}
          presence={presence}
          filter={filter}
          onNarrow={this.handleUserNarrow}
        />
        <View>
          <Button
            customStyles={styles.logoutButton}
            secondary
            text="Switch"
            onPress={this.switchAccount}
          />
          <LogoutButton />
        </View>
      </View>
    );
  }
}
