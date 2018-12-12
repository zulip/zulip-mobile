/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';

import type { Identity, Dispatch, GlobalState, Orientation, User, PresenceState } from '../types';
import { getIdentity, getSession, getAccountDetailsUserFromEmail, getPresence } from '../selectors';
import { Screen } from '../common';
import AccountDetails from './AccountDetails';

type Props = {
  identity: Identity,
  user: User,
  orientation: Orientation,
  dispatch: Dispatch,
  presence: PresenceState,
};

class AccountDetailsScreen extends PureComponent<Props> {
  render() {
    const { identity, dispatch, orientation, user, presence } = this.props;
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
          identity={identity}
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
  identity: getIdentity(state),
  user: getAccountDetailsUserFromEmail(props.navigation.state.params.email)(state),
  orientation: getSession(state).orientation,
  presence: getPresence(state),
}))(AccountDetailsScreen);
