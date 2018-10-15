/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';

import { getServerSettings } from '../api';
import type { ApiServerSettings, Auth, Account, Dispatch, GlobalState } from '../types';
import { getAuth, getAccounts } from '../selectors';
import { Centerer, ZulipButton, Logo, Screen } from '../common';
import AccountList from './AccountList';
import {
  navigateToAuth,
  navigateToRealmScreen,
  switchAccount,
  removeAccount,
  realmAdd,
} from '../actions';

const styles = StyleSheet.create({
  button: {
    marginTop: 8,
  },
});

type Props = {|
  auth: Auth,
  accounts: Account[],
  dispatch: Dispatch,
|};

type State = {|
  progress: number,
|};

class AccountPickScreen extends PureComponent<Props, State> {
  state = {
    progress: -1,
  };

  handleReLogin = async (index: number) => {
    const { accounts, dispatch } = this.props;
    const { realm } = accounts[index];
    this.setState({ progress: index });
    try {
      const serverSettings: ApiServerSettings = await getServerSettings(realm);
      dispatch(realmAdd(realm));
      dispatch(navigateToAuth(serverSettings));
    } catch (err) {
      dispatch(navigateToRealmScreen(realm));
    } finally {
      this.setState({ progress: -1 });
    }
  };

  handleAccountSelect = (index: number) => {
    const { accounts, dispatch } = this.props;
    const { apiKey } = accounts[index];
    if (apiKey) {
      setTimeout(() => {
        dispatch(switchAccount(index));
      });
    } else {
      this.handleReLogin(index);
    }
  };

  handleAccountRemove = (index: number) => {
    this.props.dispatch(removeAccount(index));
  };

  render() {
    const { accounts, dispatch, auth } = this.props;
    const { progress } = this.state;

    return (
      <Screen title="Pick account" centerContent padding>
        <Centerer>
          {accounts.length === 0 && <Logo />}
          <AccountList
            accounts={accounts}
            onAccountSelect={this.handleAccountSelect}
            onAccountRemove={this.handleAccountRemove}
            auth={auth}
            progress={progress}
          />
          <ZulipButton
            text="Add new account"
            style={styles.button}
            onPress={() => {
              dispatch(navigateToRealmScreen());
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
