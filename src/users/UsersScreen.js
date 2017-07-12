/* @flow */
import React, { PureComponent } from 'react';

import SearchScreen from '../search/SearchScreen';
import UserListCard from './UserListCard';

export default class UsersScreen extends PureComponent {
  state: {
    filter: string,
  };

  state = {
    filter: '',
  };

  handleFilterChange = (filter: string) => this.setState({ filter });

  render() {
    const { filter } = this.state;
    return (
      <SearchScreen searchBarOnChange={this.handleFilterChange}>
        <UserListCard filter={filter} />
      </SearchScreen>
    );
  }
}
