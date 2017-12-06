/* @flow */
import React, { PureComponent } from 'react';

import type { Auth, Actions, Orientation, UserType } from '../types';
import connectWithActions from '../connectWithActions';
import { getAuth, getAccountDetailsUser } from '../selectors';
import { Screen } from '../common';
import AccountDetails from './AccountDetails';

type Props = {
  auth: Auth,
  user: UserType,
  orientation: Orientation,
  actions: Actions,
};

class AccountDetailsScreen extends PureComponent<Props> {
  props: Props;

  render() {
    const { auth, actions, orientation, user } = this.props;
    const title = {
      text: '{_}',
      values: {
        _: user.fullName || ' ',
      },
    };

    return (
      <Screen title={title}>
        <AccountDetails
          auth={auth}
          actions={actions}
          fullName={user.fullName}
          email={user.email}
          avatarUrl={user.avatarUrl}
          status={user.status}
          orientation={orientation}
        />
      </Screen>
    );
  }
}

export default connectWithActions(state => ({
  auth: getAuth(state),
  user: getAccountDetailsUser(state),
  orientation: state.app.orientation,
}))(AccountDetailsScreen);
