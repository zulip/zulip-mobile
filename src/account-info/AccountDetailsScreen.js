import React, { Component } from 'react';

import AccountDetails from './AccountDetails';

export default class AccountDetailsScreen extends Component {

  props: {
    fullName: string,
    email: string,
    avatarUrl: string,
  }

  render() {
    const { fullName, email, avatarUrl } = this.props;

    return (
      <Screen title="Account Details">
        <AccountDetails fullName={fullName} email={email} avatarUrl={avatarUrl} />
      </Screen>
    );
  }
}
