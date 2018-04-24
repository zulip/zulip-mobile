/* @flow */
import React, { PureComponent } from 'react';

import { Screen } from '../common';
import UsersContainer from './UsersContainer';

type Props = {};

type State = {
  filter: string,
};

export default class UsersScreen extends PureComponent<Props, State> {
  state: State;

  state = {
    filter: '',
  };

  handleFilterChange = (filter: string) => this.setState({ filter });

  render() {
    const { filter } = this.state;

    return (
      <Screen search autoFocus searchBarOnChange={this.handleFilterChange}>
        <UsersContainer filter={filter} />
      </Screen>
    );
  }
}
