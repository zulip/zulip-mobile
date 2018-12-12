/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';

import type { Identity, Dispatch, GlobalState, User, PresenceState } from '../types';
import { getIdentity, getAccountDetailsUserFromEmail, getPresence } from '../selectors';
import { Screen } from '../common';
import AccountDetails from './AccountDetails';

type Props = {|
  identity: Identity,
  user: User,
  dispatch: Dispatch,
  presence: PresenceState,
|};

class AccountDetailsScreen extends PureComponent<Props> {
  render() {
    const { identity, dispatch, user, presence } = this.props;
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
        />
      </Screen>
    );
  }
}

export default connect((state: GlobalState, props: Object) => ({
  identity: getIdentity(state),
  user: getAccountDetailsUserFromEmail(props.navigation.state.params.email)(state),
  presence: getPresence(state),
}))(AccountDetailsScreen);
