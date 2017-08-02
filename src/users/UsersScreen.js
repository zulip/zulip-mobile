/* @flow */
import React, { PureComponent } from 'react';

import SearchScreen from '../search/SearchScreen';
import UsersContainer from './UsersContainer';

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
        <UsersContainer filter={filter} />
      </SearchScreen>
    );
  }
}
