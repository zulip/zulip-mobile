/* @flow strict-local */

import React, { PureComponent } from 'react';

import type { AppNavigationProp } from '../nav/AppNavigator';
import * as NavigationService from '../nav/NavigationService';
import type { Dispatch } from '../types';
import { connect } from '../react-redux';
import { hasAuth, getAccountStatuses } from '../selectors';
import type { AccountStatus } from './accountsSelectors';
import { Centerer, ZulipButton, Logo, Screen, ViewPlaceholder } from '../common';
import AccountList from './AccountList';
import { navigateToRealmScreen, accountSwitch, removeAccount } from '../actions';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'account'>,

  accounts: $ReadOnlyArray<AccountStatus>,
  dispatch: Dispatch,
  hasAuth: boolean,
|}>;

class AccountPickScreen extends PureComponent<Props> {
  handleAccountSelect = (index: number) => {
    const { accounts, dispatch } = this.props;
    const { realm, isLoggedIn } = accounts[index];
    if (isLoggedIn) {
      setTimeout(() => {
        dispatch(accountSwitch(index));
      });
    } else {
      NavigationService.dispatch(navigateToRealmScreen({ realm }));
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
    const { accounts } = this.props;

    return (
      <Screen
        title="Pick account"
        centerContent
        padding
        canGoBack={this.canGoBack}
        shouldShowLoadingBanner={false}
      >
        <Centerer>
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
              NavigationService.dispatch(navigateToRealmScreen());
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
