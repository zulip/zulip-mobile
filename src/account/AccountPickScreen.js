/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';

import type { Auth, Actions } from '../types';
import connectWithActions from '../connectWithActions';
import { getAuth, getAccounts } from '../selectors';
import { Centerer, ZulipButton, Logo, Screen } from '../common';
import AccountList from './AccountList';

const styles = StyleSheet.create({
  button: {
    marginTop: 8,
  },
});

type Props = {
  auth: Auth,
  accounts: any[],
  actions: Actions,
};

class AccountPickScreen extends PureComponent<Props> {
  props: Props;

  handleAccountSelect = (index: number) => {
    const { accounts, actions } = this.props;
    const { realm, apiKey } = accounts[index];
    if (apiKey) {
      setTimeout(() => {
        actions.switchAccount(index);
      });
    } else {
      actions.navigateToAddNewAccount(realm);
    }
  };

  handleAccountRemove = (index: number) => this.props.actions.removeAccount(index);

  render() {
    const { accounts, actions, auth } = this.props;

    return (
      <Screen title="Pick account" centerContent padding>
        <Centerer>
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
        </Centerer>
      </Screen>
    );
  }
}

export default connectWithActions(state => ({
  auth: getAuth(state),
  accounts: getAccounts(state),
}))(AccountPickScreen);
