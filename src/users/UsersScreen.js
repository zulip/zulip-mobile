/* @flow strict-local */
import React, { PureComponent } from 'react';

import type { RouteProp } from '../react-navigation';
import type { MainStackNavigationProp } from '../nav/MainStackScreen';
import { Screen } from '../common';
import UsersCard from './UsersCard';

type Props = $ReadOnly<{|
  navigation: MainStackNavigationProp<'users'>,
  route: RouteProp<'users', void>,
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
