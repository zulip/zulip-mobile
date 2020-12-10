/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { NavigationStackProp, NavigationStateRoute } from 'react-navigation-stack';

import NavigationService from '../nav/NavigationService';
import type { Dispatch, User } from '../types';
import { connect } from '../react-redux';
import { Screen } from '../common';
import { doNarrow, navigateBack } from '../actions';
import { pmNarrowFromEmails } from '../utils/narrow';
import UserPickerCard from '../user-picker/UserPickerCard';

type Props = $ReadOnly<{|
  // Since we've put this screen in a stack-nav route config, and we
  // don't invoke it without type-checking anywhere else (in fact, we
  // don't invoke it anywhere else at all), we know it gets the
  // `navigation` prop for free, with the stack-nav shape.
  navigation: NavigationStackProp<NavigationStateRoute>,

  dispatch: Dispatch,
|}>;

type State = {|
  filter: string,
|};

class CreateGroupScreen extends PureComponent<Props, State> {
  state = {
    filter: '',
  };

  handleFilterChange = (filter: string) => this.setState({ filter });

  handleCreateGroup = (selected: User[]) => {
    const { dispatch } = this.props;

    const recipients = selected.sort((a, b) => a.user_id - b.user_id).map(user => user.email);
    NavigationService.dispatch(navigateBack());
    dispatch(doNarrow(pmNarrowFromEmails(recipients)));
  };

  render() {
    const { filter } = this.state;
    return (
      <Screen search scrollEnabled={false} searchBarOnChange={this.handleFilterChange}>
        <UserPickerCard filter={filter} onComplete={this.handleCreateGroup} />
      </Screen>
    );
  }
}

export default connect<{||}, _, _>()(CreateGroupScreen);
