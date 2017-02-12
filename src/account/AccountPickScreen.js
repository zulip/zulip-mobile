import React from 'react';
import { StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { getAuth } from '../account/accountSelectors';
import { ZulipButton, Logo, Screen } from '../common';
import AccountList from './AccountList';
import requestInitialServerData from '../main/requestInitialServerData';

const styles = StyleSheet.create({
  button: {
    marginTop: 8,
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

      requestAnimationFrame(() => requestInitialServerData(this.props));
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
        <Logo />
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
