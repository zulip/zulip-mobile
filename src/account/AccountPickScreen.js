import React from 'react';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { Button, Logo, Screen } from '../common';
import AccountList from './AccountList';

class AccountPickScreen extends React.Component {

  props: {
    accounts: any[],
    navigateTo: () => void,
    onBack: () => void,
  }

  handleAccountSelect = (index: number) => {
    const { accounts, selectAccount, navigateTo } = this.props;
    const account = accounts.get(index);
    const { apiKey, authType } = account.toJS();
    selectAccount(index);
    if (apiKey) {
      this.props.initRoutes(['main']);
    } else {
      navigateTo(authType);
    }
  };

  handleAccountRemove = (index: number) =>
    this.props.removeAccount(index);

  render() {
    const { accounts, onBack, onNext } = this.props;

    return (
      <Screen title="Pick Account" onBack={onBack}>
        <Logo />
        <AccountList
          accounts={accounts}
          onAccountSelect={this.handleAccountSelect}
          onAccountRemove={this.handleAccountRemove}
        />
        <Button
          text="Add new account"
          onPress={onNext}
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
