import React from 'react';
import {
  View,
  Image,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import config from '../config';

import styles from './styles';
import ZulipError from './ZulipError';
import ZulipButton from './ZulipButton';

// Actions
import { markErrorsAsHandled } from '../error/errorActions';
import {
  LOGIN_FAILED,
  attemptLogin,
} from './userActions';

export class PasswordAuthView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: config.defaultLoginEmail,
      password: config.defaultLoginPassword,
    };
  }

  onSignIn = () => {
    this.props.markErrorsAsHandled(this.props.errors);
    this.props.attemptLogin(
      this.props.account,
      this.state.email,
      this.state.password,
    );
  };

  render() {
    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <Image
          style={styles.logo}
          source={require('../../static/img/zulip-logo.png')} resizeMode="contain"
        />

        <View style={styles.field}>
          <TextInput
            autoCorrect={false}
            autoFocus
            style={styles.input}
            autoCapitalize="none"
            placeholder="Email"
            value={this.state.email}
            onChangeText={email => this.setState({ email })}
          />
        </View>
        <View style={styles.field}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={this.state.password}
            onChangeText={password => this.setState({ password })}
          />
        </View>
        <View style={styles.field}>
          <ZulipButton
            text="Sign in"
            progress={this.props.pendingServerResponse}
            onPress={this.onSignIn}
          />
        </View>
        <ZulipError errors={this.props.errors} />
      </KeyboardAvoidingView>
    );
  }
}

const mapStateToProps = (state) => ({
  account: state.user.accounts.get(state.user.activeAccountId),
  pendingServerResponse: state.user.pendingServerResponse,
  errors: state.errors.filter(e => e.active && e.type === LOGIN_FAILED),
});

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators({
    attemptLogin,
    markErrorsAsHandled,
  }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PasswordAuthView);
