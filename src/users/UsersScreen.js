/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { NavigationStackProp, NavigationStateRoute } from 'react-navigation-stack';

import { Screen } from '../common';
import UsersCard from './UsersCard';

type Props = $ReadOnly<{|
  // Since we've put this screen in a stack-nav route config, and we
  // don't invoke it without type-checking anywhere else (in fact, we
  // don't invoke it anywhere else at all), we know it gets the
  // `navigation` prop for free, with the stack-nav shape.
  navigation: NavigationStackProp<NavigationStateRoute>,
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
