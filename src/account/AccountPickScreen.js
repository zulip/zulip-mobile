/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import type { Auth, Actions } from '../types';
import boundActions from '../boundActions';
import { getAuth } from '../selectors';
import { ZulipButton, Logo, Screen } from '../common';
import AccountList from './AccountList';

const styles = StyleSheet.create({
  button: {
    marginTop: 8,
  },
});

class AccountPickScreen extends PureComponent {
  props: {
    auth: Auth,
    accounts: any[],
    actions: Actions,
  };

  handleAccountSelect = (index: number) => {
    const { accounts, actions } = this.props;
    const { realm, apiKey } = accounts[index];
    if (apiKey) {
      actions.switchAccount(index); // Reset stream, message, user list
      actions.navigateToLoading();
    } else {
      actions.navigateToAddNewAccount(realm);
    }
  };

  handleAccountRemove = (index: number) => this.props.actions.removeAccount(index);

  render() {
    const { accounts, actions, auth } = this.props;

    return (
      <Screen title="Pick account" padding>
        {accounts.length === 0 && <Logo />}
        <AccountList
          accounts={accounts}
          onAccountSelect={this.handleAccountSelect}
          onAccountRemove={this.handleAccountRemove}
          auth={auth}
        />
        <ZulipButton
          text="Add new account"
          style={styles.button}
          onPress={() => actions.navigateToAddNewAccount('')}
        />
      </Screen>
    );
  }
}

export default connect(
  state => ({
    auth: getAuth(state),
    accounts: state.accounts,
  }),
  boundActions,
)(AccountPickScreen);
