/* @flow strict-local */
import React, { PureComponent } from 'react';

import type { AppNavigationProp } from '../nav/AppNavigator';
import { Screen } from '../common';
import UsersCard from './UsersCard';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'users'>,
|}>;

type State = {|
  filter: string,
|};

export default class UsersScreen extends PureComponent<Props, State> {
  state = {
    filter: '',
  };

  handleFilterChange = (filter: string) => this.setState({ filter });

  render() {
    const { filter } = this.state;

    return (
      <Screen search autoFocus scrollEnabled={false} searchBarOnChange={this.handleFilterChange}>
        <UsersCard filter={filter} />
      </Screen>
    );
  }
}
