/* @flow */
import React, { PureComponent } from 'react';

import type { Actions, PresenceState, User } from '../types';
import { privateNarrow } from '../utils/narrow';
import UserList from './UserList';
import { getOwnEmail, getUsers, getPresence } from '../selectors';
import connectWithActions from '../connectWithActions';

type Props = {
  actions: Actions,
  ownEmail: string,
  users: User[],
  filter: string,
  presences: PresenceState,
};

class UsersCard extends PureComponent<Props> {
  props: Props;

  handleUserNarrow = (email: string) => {
    const { actions } = this.props;
    actions.navigateBack();
    actions.doNarrow(privateNarrow(email));
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

export default connectWithActions(state => ({
  ownEmail: getOwnEmail(state),
  users: getUsers(state),
  presences: getPresence(state),
}))(UsersCard);
