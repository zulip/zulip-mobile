/* @flow strict-local */
import React, { PureComponent } from 'react';

import type { AppNavigationProp } from '../nav/AppNavigator';
import * as NavigationService from '../nav/NavigationService';
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
  // Since we've put this screen in AppNavigator's route config, and
  // we don't invoke it without type-checking anywhere else (in fact,
  // we don't invoke it anywhere else at all), we know it gets the
  // `navigation` prop for free, with the particular shape for this
  // route.
  navigation: AppNavigationProp<'invite-users'>,

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
    const { auth, stream } = this.props;

    const recipients = selected.map(user => user.email);
    api.subscriptionAdd(auth, [{ name: stream.name }], recipients);
    NavigationService.dispatch(navigateBack());
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
