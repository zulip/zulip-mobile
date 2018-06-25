/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';

import type { Auth, Account, Dispatch, GlobalState } from '../types';
import { getAuth, getAccounts } from '../selectors';
import { Centerer, ZulipButton, Logo, Screen } from '../common';
import AccountList from './AccountList';
import { navigateToAddNewAccount, switchAccount, removeAccount } from '../actions';

const styles = StyleSheet.create({
  button: {
    marginTop: 8,
  },
});

type Props = {
  auth: Auth,
  accounts: Account[],
  dispatch: Dispatch,
};

class AccountPickScreen extends PureComponent<Props> {
  props: Props;

  handleAccountSelect = (index: number) => {
    const { accounts, dispatch } = this.props;
    const { realm, apiKey } = accounts[index];
    if (apiKey) {
      setTimeout(() => {
        dispatch(switchAccount(index));
      });
    } else {
      dispatch(navigateToAddNewAccount(realm));
    }
  };

  handleAccountRemove = (index: number) => this.props.dispatch(removeAccount(index));

  render() {
    const { accounts, dispatch, auth } = this.props;

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
            onPress={() => {
              dispatch(navigateToAddNewAccount(''));
            }}
          />
        </Centerer>
      </Screen>
    );
  }
}

export default connect((state: GlobalState) => ({
  auth: getAuth(state),
  accounts: getAccounts(state),
}))(AccountPickScreen);
