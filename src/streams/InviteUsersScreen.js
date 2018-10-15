/* @flow */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import type { Auth, Dispatch, GlobalState, Stream, User } from '../types';
import { Screen } from '../common';
import { navigateBack } from '../actions';
import { subscriptionAdd } from '../api';
import { getAuth, getStreamFromId } from '../selectors';
import UserPickerCard from '../user-picker/UserPickerCard';

type Props = {
  dispatch: Dispatch,
  auth: Auth,
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
    const { auth, dispatch, stream } = this.props;

    const recipients = selected.map(user => user.email);
    subscriptionAdd(auth, [{ name: stream.name }], recipients);
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
  auth: getAuth(state),
  stream: getStreamFromId(props.navigation.state.params.streamId)(state),
}))(InviteUsersScreen);
