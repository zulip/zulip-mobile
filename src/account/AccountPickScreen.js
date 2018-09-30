/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';

import type { Auth, Account, Dispatch, GlobalState } from '../types';
import { getAuth, getAccounts } from '../selectors';
import { Centerer, ZulipButton, Logo, Screen, ViewPlaceholder } from '../common';
import AccountList from './AccountList';
import { navigateToAddNewAccount, switchAccount, removeAccount } from '../actions';

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
          <ViewPlaceholder height={16} />
          <ZulipButton
            text="Add new account"
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
