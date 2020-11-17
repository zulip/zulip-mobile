/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { NavigationStackProp, NavigationStateRoute } from 'react-navigation-stack';

import * as NavigationService from '../nav/NavigationService';
import type { Dispatch, User } from '../types';
import { connect } from '../react-redux';
import { Screen } from '../common';
import { doNarrow, navigateBack } from '../actions';
import { pmNarrowFromUsers } from '../utils/narrow';
import { pmKeyRecipientsFromUsers } from '../utils/recipient';
import UserPickerCard from '../user-picker/UserPickerCard';
import { getOwnUserId } from '../users/userSelectors';

type SelectorProps = {|
  +ownUserId: number,
|};

type Props = $ReadOnly<{|
  // Since we've put this screen in a stack-nav route config, and we
  // don't invoke it without type-checking anywhere else (in fact, we
  // don't invoke it anywhere else at all), we know it gets the
  // `navigation` prop for free, with the stack-nav shape.
  navigation: NavigationStackProp<NavigationStateRoute>,

  dispatch: Dispatch,
  ...SelectorProps,
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
    const { dispatch, ownUserId } = this.props;
    NavigationService.dispatch(navigateBack());
    dispatch(doNarrow(pmNarrowFromUsers(pmKeyRecipientsFromUsers(selected, ownUserId))));
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

export default connect<SelectorProps, _, _>(state => ({
  ownUserId: getOwnUserId(state),
}))(CreateGroupScreen);
