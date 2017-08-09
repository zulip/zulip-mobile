/* @flow */
import React, { PureComponent } from 'react';

import type { Actions, User } from '../types';
import { privateNarrow } from '../utils/narrow';
import UserList from './UserList';

export default class UsersCard extends PureComponent {
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
    this.props.screenProps.onNarrow();
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
