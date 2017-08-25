/* @flow */
import React, { PureComponent } from 'react';

import { Screen } from '../common';
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
      <Screen search searchBarOnChange={this.handleFilterChange}>
        <UsersContainer filter={filter} />
      </Screen>
    );
  }
}
