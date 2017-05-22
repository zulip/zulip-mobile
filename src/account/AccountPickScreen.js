/* @flow */
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import { Auth, PushRouteAction } from '../types';
import boundActions from '../boundActions';
import { getAuth } from '../account/accountSelectors';
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

class AccountPickScreen extends React.Component {

  props: {
    auth: Auth,
    accounts: any[],
    pushRoute: PushRouteAction,
    removeAccount: (number) => void,
    switchAccount: (number) => void
  };

  handleAddNewAccount = () =>
    this.props.pushRoute('realm');

  handleAccountSelect = (index: number) => {
    const { accounts, pushRoute, switchAccount } = this.props;
    const { realm, apiKey } = accounts[index];
    if (apiKey) {
      switchAccount(index); // Reset stream, message, user list
    } else {
      pushRoute('realm', { realm });
    }
  };

  handleAccountRemove = (index: number) =>
    this.props.removeAccount(index);

  render() {
    const { accounts, auth } = this.props;

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
              onPress={this.handleAddNewAccount}
            />
          </View>
        </ScrollView>
      </Screen>
    );
  }
}

export default connect(
  (state) => ({
    auth: getAuth(state),
    accounts: state.accounts,
  }),
  boundActions,
)(AccountPickScreen);
