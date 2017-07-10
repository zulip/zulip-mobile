/* @flow */
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { NULL_USER } from '../nullObjects';
import type { Auth, Actions } from '../types';
import boundActions from '../boundActions';
import { getAuth } from '../account/accountSelectors';
import { Screen } from '../common';
import AccountDetails from './AccountDetails';
import { getCurrentRoute } from '../nav/routingSelectors';


class AccountDetailsScreen extends Component {

  props: {
    auth: Auth,
    email: string,
    avatarUrl: string,
    users: Object[],
    orientation: string,
    actions: Actions,
  };
  user: Object;

  componentWillMount() {
    // props.email gets reset during navigation slide out (on back)
    // so we cache value to prevent an exception
    this.user = this.props.users.find(x => x.email === this.props.email) || NULL_USER;
  }

  render() {
    const { auth, actions, orientation } = this.props;
    const title = {
      text: '{_}',
      values: {
        _: this.user.fullName,
      },
    };

    return (
      <Screen title={title}>
        <AccountDetails
          auth={auth}
          actions={actions}
          fullName={this.user.fullName}
          email={this.user.email}
          avatarUrl={this.user.avatarUrl}
          status={this.user.status}
          fetchMessages={actions.fetchMessages}
          doNarrow={actions.doNarrow}
          popRoute={actions.popRoute}
          orientation={orientation}
        />
      </Screen>
    );
  }
}

export default connect(
  (state) => ({
    auth: getAuth(state),
    users: state.users,
    email: getCurrentRoute(state).data,
    orientation: state.app.orientation
  }),
  boundActions,
)(AccountDetailsScreen);
