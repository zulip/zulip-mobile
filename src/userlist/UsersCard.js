import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';

import { STATUSBAR_HEIGHT, BRAND_COLOR } from '../common/styles';
import { Button } from '../common';
import { privateNarrow } from '../lib/narrow';
import UserFilter from './UserFilter';
import UserList from './UserList';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
    borderColor: 'grey',
  },
  logoutButton: {
    marginTop: 10,
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

export default class UsersCard extends Component {

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

  logout = () => {
    this.props.logout();
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
            text="Logout"
            onPress={this.logout}
          />
        </View>
      </View>
    );
  }
}
