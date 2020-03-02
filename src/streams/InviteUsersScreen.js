/* @flow strict-local */
import React, { PureComponent } from 'react';

import type { NavigationScreenProp } from 'react-navigation';
import type { Auth, Dispatch, Stream, User } from '../types';
import { connect } from '../react-redux';
import { Screen } from '../common';
import { navigateBack } from '../actions';
import * as api from '../api';
import { getAuth, getStreamForId } from '../selectors';
import UserPickerCard from '../user-picker/UserPickerCard';

type SelectorProps = $ReadOnly<{|
  auth: Auth,
  stream: Stream,
|}>;

type Props = $ReadOnly<{|
  navigation: NavigationScreenProp<{ params: {| streamId: number |} }>,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

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
    api.subscriptionAdd(auth, [{ name: stream.name }], recipients);
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

export default connect<SelectorProps, _, _>((state, props) => ({
  auth: getAuth(state),
  stream: getStreamForId(state, props.navigation.state.params.streamId),
}))(InviteUsersScreen);
