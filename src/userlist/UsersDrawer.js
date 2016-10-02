import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';


import ZulipButton from '../common/ZulipButton';
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

export default class UsersDrawer extends Component {

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

  render() {
    const { users, presence } = this.props;
    const { filter } = this.state;

    return (
      <View style={styles.container}>
        <UserFilter onChange={this.handleFilterChange} />
        <UserList users={users} presence={presence} filter={filter} />
        <ZulipButton
          customStyles={styles.logoutButton}
          secondary
          text="Logout"
          onPress={this.logout}
        />
      </View>
    );
  }
}
