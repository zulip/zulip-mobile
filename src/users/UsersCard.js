/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';

import type { Dispatch, PresenceState, User } from '../types';
import { privateNarrow } from '../utils/narrow';
import UserList from './UserList';
import { getOwnEmail, getUsers, getPresence } from '../selectors';
import { navigateBack, doNarrow } from '../actions';

type Props = {
  dispatch: Dispatch,
  ownEmail: string,
  users: User[],
  filter: string,
  presences: PresenceState,
};

class UsersCard extends PureComponent<Props> {
  props: Props;

  handleUserNarrow = (email: string) => {
    const { dispatch } = this.props;
    dispatch(navigateBack());
    dispatch(doNarrow(privateNarrow(email)));
  };

  render() {
    const { ownEmail, users, filter, presences } = this.props;
    return (
      <UserList
        ownEmail={ownEmail}
        users={users}
        filter={filter}
        presences={presences}
        onPress={this.handleUserNarrow}
      />
    );
  }
}

export default connect(state => ({
  ownEmail: getOwnEmail(state),
  users: getUsers(state),
  presences: getPresence(state),
}))(UsersCard);
