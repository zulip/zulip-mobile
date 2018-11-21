/* @flow */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import type { Account, Dispatch, GlobalState, Stream, User } from '../types';
import { Screen } from '../common';
import { navigateBack } from '../actions';
import { subscriptionAdd } from '../api';
import { getActiveAccount, getStreamFromId } from '../selectors';
import UserPickerCard from '../user-picker/UserPickerCard';

type Props = {
  dispatch: Dispatch,
  account: Account,
  stream: Stream,
};

type State = {
  filter: string,
};

class InviteUsersScreen extends PureComponent<Props, State> {
  props: Props;
  state: State = {
    filter: '',
  };

  handleFilterChange = (filter: string) => this.setState({ filter });

  handleInviteUsers = (selected: User[]) => {
    const { account, dispatch, stream } = this.props;

    const recipients = selected.map(user => user.email);
    subscriptionAdd(account, [{ name: stream.name }], recipients);
    dispatch(navigateBack());
  };

  render() {
    const { filter } = this.state;
    return (
      <Screen search scrollEnabled={false} searchBarOnChange={this.handleFilterChange}>
        <UserPickerCard filter={filter} onComplete={this.handleInviteUsers} />
      </Screen>
    );
  }
}

export default connect((state: GlobalState, props: Object) => ({
  account: getActiveAccount(state),
  stream: getStreamFromId(props.navigation.state.params.streamId)(state),
}))(InviteUsersScreen);
