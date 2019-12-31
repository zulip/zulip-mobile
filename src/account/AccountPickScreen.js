/* @flow strict-local */

import React, { PureComponent } from 'react';
import { Modal } from 'react-native';

import type { Dispatch, ApiResponseServerSettings } from '../types';

import { connect } from '../react-redux';
import { hasAuth, getAccountStatuses } from '../selectors';
import type { AccountStatus } from './accountsSelectors';
import { Centerer, ZulipButton, Logo, Screen, ViewPlaceholder } from '../common';
import AccountList from './AccountList';
import { navigateToRealmScreen, switchAccount, removeAccount, navigateToAuth } from '../actions';
import * as api from '../api';
import { showErrorAlert } from '../utils/info';
import LoadingIndicator from '../common/LoadingIndicator';

type Props = $ReadOnly<{|
  accounts: AccountStatus[],
  dispatch: Dispatch,
  hasAuth: boolean,
|}>;

type State = {
  progress: boolean,
};

class AccountPickScreen extends PureComponent<Props, State> {
  state = {
    progress: false,
  };

  handleAccountSelect = async (index: number) => {
    this.setState({ progress: true });
    const { accounts, dispatch } = this.props;
    const { realm, isLoggedIn } = accounts[index];
    if (isLoggedIn) {
      setTimeout(() => {
        dispatch(switchAccount(index));
      });
    } else {
      try {
        const serverSettings: ApiResponseServerSettings = await api.getServerSettings(realm);
        dispatch(navigateToAuth(serverSettings));
        this.setState({ progress: false });
      } catch (error) {
        showErrorAlert(error.message, 'Failed to connect server');
      }
    }
  };

  handleAccountRemove = (index: number) => {
    this.props.dispatch(removeAccount(index));
  };

  // We can get here three ways:
  //  * the "switch accounts" button
  //  * the "log out" button
  //  * as the initial screen, if we have a known account but no API key.
  //
  // The "log out" button is a bit exceptional because it's the user
  // taking a navigational action... but the screen they just left
  // required the login they've just discarded, so they can't go back.
  //
  // So, show a "navigate back" UI in the first case, but not the other two.
  canGoBack = this.props.hasAuth;

  render() {
    const { accounts, dispatch } = this.props;

    return (
      <Screen title="Pick account" centerContent padding canGoBack={this.canGoBack}>
        <Centerer>
          {this.state.progress ? (
            <Modal transparent={false}>
              <LoadingIndicator />
            </Modal>
          ) : null}
          {accounts.length === 0 && <Logo />}
          <AccountList
            accounts={accounts}
            onAccountSelect={this.handleAccountSelect}
            onAccountRemove={this.handleAccountRemove}
          />
          <ViewPlaceholder height={16} />
          <ZulipButton
            text="Add new account"
            onPress={() => {
              dispatch(navigateToRealmScreen());
            }}
          />
        </Centerer>
      </Screen>
    );
  }
}

export default connect(state => ({
  accounts: getAccountStatuses(state),
  hasAuth: hasAuth(state),
}))(AccountPickScreen);
