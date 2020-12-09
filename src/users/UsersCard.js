/* @flow strict-local */

import React, { PureComponent } from 'react';

import NavigationService from '../nav/NavigationService';
import type { Dispatch, PresenceState, User, UserOrBot } from '../types';
import { connect } from '../react-redux';
import { pm1to1NarrowFromUser } from '../utils/narrow';
import UserList from './UserList';
import { getUsers, getPresence } from '../selectors';
import { navigateBack, doNarrow } from '../actions';

type Props = $ReadOnly<{|
  dispatch: Dispatch,
  users: User[],
  filter: string,
  presences: PresenceState,
|}>;

class UsersCard extends PureComponent<Props> {
  handleUserNarrow = (user: UserOrBot) => {
    const { dispatch } = this.props;
    NavigationService.dispatch(navigateBack());
    dispatch(doNarrow(pm1to1NarrowFromUser(user)));
  };

  render() {
    const { users, filter, presences } = this.props;
    return (
      <UserList
        users={users}
        filter={filter}
        presences={presences}
        onPress={this.handleUserNarrow}
      />
    );
  }
}

export default connect(state => ({
  users: getUsers(state),
  presences: getPresence(state),
}))(UsersCard);
