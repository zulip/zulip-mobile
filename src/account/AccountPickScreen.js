import React from 'react';
import {
  View,
} from 'react-native';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import config from '../config';

import { markErrorsAsHandled } from '../error/errorActions';
import {
  addAccount,
} from './accountActions';

import styles from '../common/styles';
import Button from '../common/Button';
import AccountList from './AccountList';

class AccountPickScreen extends React.Component {
  constructor(props) {
    super(props);

    const realmFromConfig = process.env.NODE_ENV === 'development' ? config.devRealm : config.productionRealm;
    this.state = {
      realm: props.realm || realmFromConfig,
    };
  }

  onRealmEnter = () => {
    this.props.markErrorsAsHandled(this.props.errors);
    this.props.addAccount(this.state.realm);
  }

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
