import React from 'react';
import {
  View,
} from 'react-native';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  addAccount,
} from '../account/accountActions';

import Button from '../common/Button';
import AccountList from './AccountList';

class AccountPickScreen extends React.Component {

  props: {
    accounts: any[],
    onNext: () => void,
  }

  static defaultProps = {
    accounts: [],
  }

  render() {
    const { accounts, onNext } = this.props;

    return (
      <View>
        <AccountList accounts={accounts} />
        <Button
          text="Add new account"
          onPress={onNext}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  pendingServerResponse: state.app.get('pendingServerResponse'),
  errors: state.errors.filter(e => e.active),
});

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators({
    addAccount,
  }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(AccountPickScreen);
