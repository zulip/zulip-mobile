import React, { Component } from 'react';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { getAuth } from '../account/accountSelectors';
import { Screen } from '../common';
import { getFullUrl } from '../utils/url';
import AccountDetails from './AccountDetails';
import { getCurrentRoute } from '../nav/routingSelectors';

class AccountDetailsScreen extends Component {

  props: {
    fullName: string,
    email: string,
    avatarUrl: string,
  }

  render() {
    const { auth, email, users, fetchMessages, popRoute } = this.props;
    const { fullName, avatarUrl, status } = users.find(x => x.email === email) || { fullName: 'A', avatarUrl: '', status: 'unknown' };
    const fullAvatarUrl = getFullUrl(avatarUrl, auth.realm);

    return (
      <Screen title="Account Details">
        <AccountDetails
          auth={auth}
          fullName={fullName}
          email={email}
          avatarUrl={fullAvatarUrl}
          status={status}
          fetchMessages={fetchMessages}
          popRoute={popRoute}
        />
      </Screen>
    );
  }
}

export default connect(
  (state) => ({
    auth: getAuth(state),
    users: state.userlist,
    email: getCurrentRoute(state).data,
  }),
  boundActions,
)(AccountDetailsScreen);
