/* @flow */
import React, { PureComponent } from 'react';

import type { Auth, Actions, Orientation, User, PresenceState } from '../types';
import { connectWithActionsPreserveOnBack } from '../connectWithActions';
import { getAuth, getSession, getAccountDetailsUser, getPresence } from '../selectors';
import { Screen } from '../common';
import AccountDetails from './AccountDetails';

type Props = {
  auth: Auth,
  user: User,
  orientation: Orientation,
  actions: Actions,
  presence: PresenceState,
};

class AccountDetailsScreen extends PureComponent<Props> {
  props: Props;

  render() {
    const { auth, actions, orientation, user, presence } = this.props;
    const title = {
      text: '{_}',
      values: {
        _: user.full_name || ' ',
      },
    };

    return (
      <Screen title={title}>
        <AccountDetails
          auth={auth}
          actions={actions}
          fullName={user.full_name}
          email={user.email}
          avatarUrl={user.avatar_url}
          presence={presence[user.email]}
          orientation={orientation}
        />
      </Screen>
    );
  }
}

export default connectWithActionsPreserveOnBack(state => ({
  auth: getAuth(state),
  user: getAccountDetailsUser(state),
  orientation: getSession(state).orientation,
  presence: getPresence(state),
}))(AccountDetailsScreen);
