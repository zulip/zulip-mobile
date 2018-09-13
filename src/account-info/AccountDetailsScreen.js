/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';

import type { Auth, Dispatch, GlobalState, Orientation, User, PresenceState } from '../types';
import { getAuth, getSession, getAccountDetailsUserFromEmail, getPresence } from '../selectors';
import { Screen } from '../common';
import AccountDetails from './AccountDetails';

type Props = {
  auth: Auth,
  user: User,
  orientation: Orientation,
  dispatch: Dispatch,
  presence: PresenceState,
};

class AccountDetailsScreen extends PureComponent<Props> {
  props: Props;

  render() {
    const { auth, dispatch, orientation, user, presence } = this.props;
    const title = {
      text: '{_}',
      values: {
        // This causes the name not to get translated.
        _: user.full_name || ' ',
      },
    };

    return (
      <Screen title={title}>
        <AccountDetails
          auth={auth}
          dispatch={dispatch}
          user={user}
          presence={presence[user.email]}
          orientation={orientation}
        />
      </Screen>
    );
  }
}

export default connect((state: GlobalState, props: Object) => ({
  auth: getAuth(state),
  user: getAccountDetailsUserFromEmail(props.navigation.state.params.email)(state),
  orientation: getSession(state).orientation,
  presence: getPresence(state),
}))(AccountDetailsScreen);
