/* @flow */
import React, { PureComponent } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
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
  padding: {
    padding: 8,
  },
});

class AccountPickScreen extends PureComponent {
  props: {
    auth: Auth,
    accounts: any[],
    actions: Actions,
  };

  handleAddNewAccount = () => this.props.actions.navigateToRealm();

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
      <Screen title="Pick account">
        <ScrollView centerContent>
          <Logo />
          <View style={styles.padding}>
            <AccountList
              accounts={accounts}
              onAccountSelect={this.handleAccountSelect}
              onAccountRemove={this.handleAccountRemove}
              auth={auth}
            />
            <ZulipButton
              text="Add new account"
              style={styles.button}
              onPress={actions.navigateToAddNewAccount}
            />
          </View>
        </ScrollView>
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
