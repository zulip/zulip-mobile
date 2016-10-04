import React from 'react';
import {
  View,
} from 'react-native';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { markErrorsAsHandled } from '../error/errorActions';
import {
  addAccount,
} from '../account/accountActions';

import styles from '../common/styles';
import Button from '../common/Button';
import AccountList from './AccountList';

class AccountPickScreen extends React.Component {

  render() {
    // const { pendingServerResponse, errors } = this.props;
    const accounts = [];

    return (
      <View>
        <AccountList accounts={accounts} />
        <Button
          text="Add new account"
          onPress={this.onRealmEnter}
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
    markErrorsAsHandled,
  }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(AccountPickScreen);
