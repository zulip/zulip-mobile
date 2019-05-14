/* @flow strict-local */
import React, { PureComponent } from 'react';

import type { Auth, Dispatch, GlobalState, Stream, User } from '../types';
import { connectFlowFixMe } from '../react-redux';
import { Screen } from '../common';
import { navigateBack } from '../actions';
import { subscriptionAdd } from '../api';
import { getAuth, getStreamForId } from '../selectors';
import UserPickerCard from '../user-picker/UserPickerCard';

type Props = {|
  dispatch: Dispatch,
  auth: Auth,
  stream: Stream,
|};

type State = {|
  filter: string,
|};

class InviteUsersScreen extends PureComponent<Props, State> {
  state = {
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

export default connectFlowFixMe((state: GlobalState, props) => ({
  auth: getAuth(state),
  stream: getStreamForId(state, props.navigation.state.params.streamId),
}))(InviteUsersScreen);
