/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';

import type { Dispatch, GlobalState, User } from '../types';
import { getAccountDetailsUserFromEmail } from '../selectors';
import { Screen } from '../common';
import AccountDetails from './AccountDetails';

type Props = {|
  user: User,
  dispatch: Dispatch,
|};

class AccountDetailsScreen extends PureComponent<Props> {
  render() {
    const { dispatch, user } = this.props;
    const title = {
      text: '{_}',
      values: {
        // This causes the name not to get translated.
        _: user.full_name || ' ',
      },
    };

    return (
      <Screen title={title}>
        <AccountDetails dispatch={dispatch} user={user} />
      </Screen>
    );
  }
}

export default connect((state: GlobalState, props) => ({
  user: getAccountDetailsUserFromEmail(props.navigation.state.params.email)(state),
}))(AccountDetailsScreen);
