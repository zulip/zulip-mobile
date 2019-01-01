/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';

import type { NavigationScreenProp } from 'react-navigation';
import type { Dispatch, GlobalState, User, PresenceState } from '../types';
import { getAccountDetailsUserFromEmail, getPresence } from '../selectors';
import { Screen } from '../common';
import AccountDetails from './AccountDetails';

type Props = {|
  user: User,
  dispatch: Dispatch,
  presence: PresenceState,
|};

class AccountDetailsScreen extends PureComponent<Props> {
  render() {
    const { dispatch, user, presence } = this.props;
    const title = {
      text: '{_}',
      values: {
        // This causes the name not to get translated.
        _: user.full_name || ' ',
      },
    };

    return (
      <Screen title={title}>
        <AccountDetails dispatch={dispatch} user={user} presence={presence[user.email]} />
      </Screen>
    );
  }
}

type ConnectorProps = {|
  navigation: NavigationScreenProp<*> & {
    state: {
      params: {
        email: string,
      },
    },
  },
|};

export default connect((state: GlobalState, props: ConnectorProps) => ({
  user: getAccountDetailsUserFromEmail(props.navigation.state.params.email)(state),
  presence: getPresence(state),
}))(AccountDetailsScreen);
