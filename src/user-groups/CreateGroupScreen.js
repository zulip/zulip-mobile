/* @flow strict-local */
import React, { PureComponent } from 'react';

import type { AppNavigationProp, AppNavigationRouteProp } from '../nav/AppNavigator';
import * as NavigationService from '../nav/NavigationService';
import type { Dispatch, UserId, UserOrBot } from '../types';
import { connect } from '../react-redux';
import { Screen } from '../common';
import { doNarrow, navigateBack } from '../actions';
import { pmNarrowFromUsers } from '../utils/narrow';
import { pmKeyRecipientsFromUsers } from '../utils/recipient';
import UserPickerCard from '../user-picker/UserPickerCard';
import { getOwnUserId } from '../users/userSelectors';

type SelectorProps = {|
  +ownUserId: UserId,
|};

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'create-group'>,
  route: AppNavigationRouteProp<'create-group'>,

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

  handleCreateGroup = (selected: UserOrBot[]) => {
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
