/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';

import type { Dispatch, GlobalState, PresenceState, User } from '../types';
import { privateNarrow } from '../utils/narrow';
import UserList from './UserList';
import { getUsers, getPresence } from '../selectors';
import { navigateBack, doNarrow } from '../actions';

type Props = {|
  dispatch: Dispatch,
  users: User[],
  filter: string,
  presences: PresenceState,
|};

class UsersCard extends PureComponent<Props> {
  handleUserNarrow = ({ email }) => {
    const { dispatch } = this.props;
    dispatch(navigateBack());
    dispatch(doNarrow(privateNarrow(email)));
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

export default connect((state: GlobalState) => ({
  users: getUsers(state),
  presences: getPresence(state),
}))(UsersCard);
