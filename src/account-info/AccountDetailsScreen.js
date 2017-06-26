/* @flow */
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Auth } from '../types';
import boundActions from '../boundActions';
import { getAuth } from '../account/accountSelectors';
import { Screen } from '../common';
import AccountDetails from './AccountDetails';
import { getCurrentRoute } from '../nav/routingSelectors';

const NOT_FOUND_USER = {
  fullName: 'User not found',
  status: '',
  avatarUrl: ''
};

class AccountDetailsScreen extends Component {

  props: {
    auth: Auth,
    email: string,
    avatarUrl: string,
    users: Object[],
    orientation: string,
    fetchMessages: () => void,
    doNarrow: (string) => void,
    popRoute: (string) => void,
  };
  user: Object;

  componentWillMount() {
    // props.email gets reset during navigation slide out (on back)
    // so we cache value to prevent an exception
    this.user = this.props.users.find(x => x.email === this.props.email) || NOT_FOUND_USER;
  }

  render() {
    const { auth, fetchMessages, doNarrow, popRoute, orientation } = this.props;

    return (
      <Screen title={this.user.fullName}>
        <AccountDetails
          auth={auth}
          fullName={this.user.fullName}
          email={this.user.email}
          avatarUrl={this.user.avatarUrl}
          status={this.user.status}
          fetchMessages={fetchMessages}
          doNarrow={doNarrow}
          popRoute={popRoute}
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
