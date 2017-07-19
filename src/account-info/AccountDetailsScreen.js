/* @flow */
import React, { Component } from 'react';
import { connect } from 'react-redux';

import type { Auth, Actions, UserType } from '../types';
import boundActions from '../boundActions';
import { getAuth, getAccountDetailsUser } from '../selectors';
import { Screen } from '../common';
import AccountDetails from './AccountDetails';

class AccountDetailsScreen extends Component {
  props: {
    auth: Auth,
    user: UserType,
    orientation: string,
    actions: Actions,
  };

  shouldComponentUpdate(nextProps) {
    return nextProps.user.fullName !== '';
  }

  render() {
    const { auth, actions, orientation, user } = this.props;
    const title = {
      text: '{_}',
      values: {
        _: user.fullName,
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

export default connect(
  state => ({
    auth: getAuth(state),
    user: getAccountDetailsUser(state),
    orientation: state.app.orientation,
  }),
  boundActions,
)(AccountDetailsScreen);
