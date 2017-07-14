/* @flow */
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { NULL_USER } from '../nullObjects';
import type { Auth, Actions } from '../types';
import boundActions from '../boundActions';
import { getAuth } from '../selectors';
import { Screen } from '../common';
import AccountDetails from './AccountDetails';

class AccountDetailsScreen extends Component {
  props: {
    auth: Auth,
    navigation: Object,
    users: Object[],
    orientation: string,
    actions: Actions,
  };

  render() {
    const { auth, actions, navigation, orientation, users } = this.props;
    const { email } = navigation.state.params;

    const user = users.find(x => x.email === email) || NULL_USER;
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
    users: state.users,
    orientation: state.app.orientation,
  }),
  boundActions,
)(AccountDetailsScreen);
