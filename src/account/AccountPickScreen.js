import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

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
    accounts: any[],
  }

  handleAddNewAccount = () =>
    this.props.pushRoute('realm');

  handleAccountSelect = (index: number) => {
    const { accounts, pushRoute, switchAccount } = this.props;
    const { apiKey } = accounts[index];
    if (apiKey) {
      switchAccount(index); // Reset stream, message, user list
    } else {
      pushRoute('realm');
    }
  };

  handleAccountRemove = (index: number) =>
    this.props.removeAccount(index);

  render() {
    const { accounts } = this.props;

    return (
      <Screen title="Pick Account">
        <StatusBar hidden={false} />
        <Logo />
        <View style={styles.padding}>
          <AccountList
            accounts={accounts}
            onAccountSelect={this.handleAccountSelect}
            onAccountRemove={this.handleAccountRemove}
          />
          <ZulipButton
            text="Add new account"
            customStyles={styles.button}
            onPress={this.handleAddNewAccount}
          />
        </View>
      </Screen>
    );
  }
}

export default connect(
  (state) => ({
    auth: getAuth(state),
    accounts: state.account,
  }),
  boundActions,
)(AccountPickScreen);
