import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { removeAccount, tryPasswordLogin } from '../account/accountActions';
import { Button, Logo, Screen } from '../common';
import AccountList from './AccountList';

class AccountPickScreen extends React.Component {

  props: {
    accounts: any[],
    navigateTo: () => void,
    onBack: () => void,
  }

  handleAccountSelect = (index: number) => {
    const { accounts, navigateTo } = this.props;
    const account = accounts.get(index);
    const { apiKey, email, password } = account.toJS();
    if (apiKey) {
      navigateTo('main');
    } else if (password) {
      tryPasswordLogin(undefined, email, password);
    } else {
      navigateTo('password');
    }
  };

  handleAccountRemove = (index: number) =>
    this.props.removeAccount(index);

  render() {
    const { accounts, onBack, onNext } = this.props;

    return (
      <Screen title="Pick Account" onBack={onBack}>
        <Logo />
        <AccountList
          accounts={accounts}
          onAccountSelect={this.handleAccountSelect}
          onAccountRemove={this.handleAccountRemove}
        />
        <Button
          text="Add new account"
          onPress={onNext}
        />
      </Screen>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accountlist,
  pendingServerResponse: state.app.get('pendingServerResponse'),
  errors: state.errors.filter(e => e.active),
});

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators({
    removeAccount,
    tryPasswordLogin,
  }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(AccountPickScreen);
