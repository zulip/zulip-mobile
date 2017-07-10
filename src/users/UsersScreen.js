/* @flow */
import React, { Component } from 'react';
import shallowCompare from 'react-addons-shallow-compare';

import SearchScreen from '../search/SearchScreen';
import UserListCard from './UserListCard';

type StateProps = {
  filter: string,
};

export default class UsersScreen extends Component {
  state: StateProps;

  constructor() {
    super();
    this.state = {
      filter: '',
    };
  }

  shouldComponentUpdate(nextProps: void, nextState: StateProps) {
    return shallowCompare(this, nextProps, nextState);
  }

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
