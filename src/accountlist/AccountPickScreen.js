import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  addAccount,
} from '../account/accountActions';

import Logo from '../common/Logo';
import Screen from '../common/Screen';
import Button from '../common/Button';
import AccountList from './AccountList';

class AccountPickScreen extends React.Component {

  props: {
    accounts: any[],
    onBack: () => void,
    onNext: () => void,
  }

  render() {
    const { accounts, onBack, onNext } = this.props;

    return (
      <Screen onBack={onBack}>
        <Logo />
        <AccountList accounts={accounts} onAccountSelect={onNext} />
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
    addAccount,
  }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(AccountPickScreen);
