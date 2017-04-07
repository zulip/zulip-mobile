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

  componentWillMount() {
    // props.email gets reset during navigation slide out (on back)
    // so we cache the value to prevent an exception
    this.email = this.props.email;
  }

  render() {
    const { auth, users, fetchMessages, doNarrow, popRoute } = this.props;
    const { fullName, avatarUrl, status } = users.find(x => x.email === this.email);
    const fullAvatarUrl = getFullUrl(avatarUrl, auth.realm);

    return (
      <Screen title="Account details">
        <AccountDetails
          auth={auth}
          fullName={fullName}
          email={this.email}
          avatarUrl={fullAvatarUrl}
          status={status}
          fetchMessages={fetchMessages}
          doNarrow={doNarrow}
          popRoute={popRoute}
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
  }),
  boundActions,
)(AccountDetailsScreen);
