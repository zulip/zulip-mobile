import React from 'react';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { Button, Logo, Screen } from '../common';
import AccountList from './AccountList';

class AccountPickScreen extends React.Component {

  props: {
    accounts: any[],
  }

  handleAddNewAccount = () =>
    this.props.pushRoute('realm');

  handleAccountSelect = (index: number) => {
    const { accounts, selectAccount, pushRoute, initRoutes } = this.props;
    const { apiKey, authType } = accounts[index];
    selectAccount(index);
    if (apiKey) {
      initRoutes(['main']);
    } else {
      pushRoute(authType);
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
    accounts: state.account,
  }),
  boundActions,
)(AccountPickScreen);
