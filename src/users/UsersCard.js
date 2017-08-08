/* @flow */
import React, { PureComponent } from 'react';

import type { Actions, User } from '../types';
import { privateNarrow } from '../utils/narrow';
import UserList from './UserList';

export default class UsersCard extends PureComponent {
  props: {
    actions: Actions,
    ownEmail: string,
    users: User[],
    filter: string,
  };

  handleUserNarrow = (email: string) => {
    const { actions } = this.props;
    actions.doNarrow(privateNarrow(email));
    actions.navigateBack();
  };

  render() {
    const { ownEmail, users, filter } = this.props;
    return (
      <UserList ownEmail={ownEmail} users={users} filter={filter} onPress={this.handleUserNarrow} />
    );
  }
}
