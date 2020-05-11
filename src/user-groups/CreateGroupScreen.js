/* @flow strict-local */
import React, { PureComponent } from 'react';

import type { Dispatch, User } from '../types';
import { connect } from '../react-redux';
import { Screen } from '../common';
import { doNarrow, navigateBack } from '../actions';
import { groupNarrow } from '../utils/narrow';
import UserPickerCard from '../user-picker/UserPickerCard';

type Props = $ReadOnly<{|
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

    const recipients = selected.map(user => user.email);
    dispatch(navigateBack());
    dispatch(doNarrow(groupNarrow(recipients)));
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
