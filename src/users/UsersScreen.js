/* @flow strict-local */
import React, { PureComponent } from 'react';

import type { AppNavigationProp } from '../nav/AppNavigator';
import { Screen } from '../common';
import UsersCard from './UsersCard';

type Props = $ReadOnly<{|
  // Since we've put this screen in AppNavigator's route config, and
  // we don't invoke it without type-checking anywhere else (in fact,
  // we don't invoke it anywhere else at all), we know it gets the
  // `navigation` prop for free, with the particular shape for this
  // route.
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
