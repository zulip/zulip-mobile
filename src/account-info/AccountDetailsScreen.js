import React, { Component } from 'react';
import { connect } from 'react-redux';

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
    const { auth, email, users } = this.props;
    const { fullName, avatarUrl } = users.find(x => x.email === email) || { fullName: 'A', avatarUrl: '' };
    const fullAvatarUrl = getFullUrl(avatarUrl, auth.realm);

    return (
      <Screen title="Account Details">
        <AccountDetails
          fullName={fullName}
          email={auth.email}
          avatarUrl={fullAvatarUrl}
        />
      </Screen>
    );
  }
}

export default connect(
  (state) => ({
    auth: state.account[0],
    users: state.userlist,
    email: getCurrentRoute(state).data,
  }),
)(AccountDetailsScreen);
