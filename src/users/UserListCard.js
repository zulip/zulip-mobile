/* @flow */
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getOwnEmail, getCurrentRealm } from '../account/accountSelectors';
import boundActions from '../boundActions';
import type { Actions, User } from '../types';
import { privateNarrow } from '../utils/narrow';
import UserList from './UserList';

type Props = {
  actions: Actions,
  ownEmail: string,
  realm: string,
  users: User[],
  filter: string,
};

class UserListCard extends Component {
  props: Props;

  state = {
    onNarrow: () => {},
  };

  handleUserNarrow = (email: string) => {
    const { actions } = this.props;
    actions.doNarrow(privateNarrow(email));
    actions.popRoute();
  };

  render() {
    const { ownEmail, realm, users, filter } = this.props;
    return (
      <UserList
        ownEmail={ownEmail}
        users={users}
        filter={filter}
        realm={realm}
        onNarrow={this.handleUserNarrow}
      />
    );
  }
}

export default connect(
  state => ({
    ownEmail: getOwnEmail(state),
    realm: getCurrentRealm(state),
    users: state.users,
  }),
  boundActions,
)(UserListCard);
