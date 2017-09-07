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
    presences: Object,
  };

  handleUserNarrow = (email: string) => {
    const { actions } = this.props;
    actions.doNarrow(privateNarrow(email));
    actions.navigateBack();
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
