import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';


import Button from '../common/Button';
import UserFilter from './UserFilter';
import UserList from './UserList';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    marginTop: 20,
    backgroundColor: 'white',
    borderColor: 'grey',
  },
  logoutButton: {
    marginTop: 10,
  },
});

type Props = {
  users: string[],
  presence: Object,
};

export default class UsersCard extends Component {

  props: Props;

  state: {
    filter: string,
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
    // TODO send narrow event
  }

  render() {
    const { users, presence } = this.props;
    const { filter } = this.state;

    return (
      <View style={styles.container}>
        <UserFilter onChange={this.handleFilterChange} />
        <UserList
          users={users}
          presence={presence}
          filter={filter}
          onNarrow={this.handleUserNarrow}
        />
        <Button
          customStyles={styles.logoutButton}
          secondary
          text="Logout"
          onPress={this.logout}
        />
      </View>
    );
  }
}
