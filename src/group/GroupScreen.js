/* @flow */
import React, { PureComponent } from 'react';

import { Screen } from '../common';
import GroupCard from './GroupCard';

type State = {
  filter: string,
};

export default class GroupScreen extends PureComponent<{}, State> {
  state: State;

  state = {
    filter: '',
  };

  handleFilterChange = (filter: string) => this.setState({ filter });

  render() {
    const { filter } = this.state;
    return (
      <Screen search searchBarOnChange={this.handleFilterChange}>
        <GroupCard filter={filter} />
      </Screen>
    );
  }
}
