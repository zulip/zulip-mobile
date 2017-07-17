/* @flow */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import { getOwnEmail, getCurrentRealm, getAllActiveUsers } from '../selectors';
import boundActions from '../boundActions';
import type { Actions, User } from '../types';
import { privateNarrow } from '../utils/narrow';
import UserList from './UserList';

class UserListCard extends PureComponent {
  props: {
    actions: Actions,
    ownEmail: string,
    realm: string,
    users: User[],
    filter: string,
  };

  handleUserNarrow = (email: string) => {
    const { actions } = this.props;
    actions.doNarrow(privateNarrow(email));
    actions.navigateBack();
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
    users: getAllActiveUsers(state),
  }),
  boundActions,
)(UserListCard);
