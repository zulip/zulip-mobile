import React from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import config from '../config';

// Actions
import { markErrorsAsHandled } from '../error/errorActions';
import {
  addAccount,
} from './userActions';

import styles from '../common/styles';
import ZulipLogo from '../common/ZulipLogo';
import ZulipError from '../common/ZulipError';
import ZulipButton from '../common/ZulipButton';

class ZulipAccountsView extends React.Component {
  constructor(props) {
    super(props);

    console.log(props.auth.toJS());
    const realmFromConfig = process.env.NODE_ENV === 'development' ? config.devRealm : config.productionRealm;
    this.state = {
      realm: props.auth.get('realm') || realmFromConfig,
    };
  }

  onRealmEnter = () => {
    this.props.markErrorsAsHandled(this.props.errors);
    this.props.addAccount(this.state.realm);
  }

  render() {
    const { pendingServerResponse, errors } = this.props;

    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <ZulipLogo />

        <View style={styles.field}>
          <Text style={styles.heading1}>Welcome to Zulip</Text>
        </View>

        <View style={styles.smallField}>
          <Text style={styles.label}>Server address</Text>
        </View>

        <View style={styles.field}>
          <TextInput
            style={styles.input}
            autoFocus
            autoCorrect={false}
            autoCapitalize="none"
            placeholder="www.zulip.com"
            value={this.state.realm}
            onChangeText={realm => this.setState({ realm })}
          />
        </View>

        <View style={styles.field}>
          <ZulipButton
            text="Next"
            progress={pendingServerResponse}
            onPress={this.onRealmEnter}
          />
        </View>

        <ZulipError errors={errors} />
      </KeyboardAvoidingView>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  pendingServerResponse: state.user.pendingServerResponse,
  errors: state.errors.filter(e => e.active),
});

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators({
    addAccount,
    markErrorsAsHandled,
  }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ZulipAccountsView);
