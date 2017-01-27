import React from 'react';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { getAuth } from '../account/accountSelectors';
import { Button, Logo, Screen } from '../common';
import AccountList from './AccountList';

class AccountPickScreen extends React.Component {

  props: {
    accounts: any[],
  }

  handleAddNewAccount = () =>
    this.props.pushRoute('realm');

  handleAccountSelect = (index: number) => {
    const { accounts, pushRoute, switchAccount } = this.props;
    const { apiKey } = accounts[index];
    if (apiKey) {
      switchAccount(index); // Reset stream, message, user list

      setTimeout(() => {
        const { auth, fetchEvents, fetchUsersAndStatus, fetchMessages } = this.props;

        fetchEvents(auth);
        fetchUsersAndStatus(auth);
        fetchMessages(auth, Number.MAX_SAFE_INTEGER, 20, 0, []);
      }, 50);
    } else {
      pushRoute('realm');
    }
  };

  handleAccountRemove = (index: number) =>
    this.props.removeAccount(index);

  render() {
    const { accounts } = this.props;

    return (
      <Screen title="Pick Account">
        <Logo />
        <AccountList
          accounts={accounts}
          onAccountSelect={this.handleAccountSelect}
          onAccountRemove={this.handleAccountRemove}
        />
        <Button
          text="Add new account"
          onPress={this.handleAddNewAccount}
        />
      </Screen>
    );
  }
}

export default connect(
  (state) => ({
    auth: getAuth(state),
    accounts: state.account,
  }),
  boundActions,
)(AccountPickScreen);
