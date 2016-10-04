import React from 'react';
import {
  View,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import config from '../config';

import styles from '../common/styles';
import ErrorMsg from '../common/ErrorMsg';
import Button from '../common/Button';

// Actions
import { markErrorsAsHandled } from '../error/errorActions';
import {
  LOGIN_FAILED,
  attemptLogin,
} from '../account/accountActions';

class PasswordAuthScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: props.email || config.defaultLoginEmail,
      password: props.password || config.defaultLoginPassword,
    };
  }

  onSignIn = () => {
    this.props.markErrorsAsHandled(this.props.errors);
    this.props.attemptLogin(
      this.props.auth,
      this.state.email,
      this.state.password,
    );
  };

  render() {
    const { errors, pendingServerResponse } = this.props;
    const { email, password } = this.state;

    return (
      <KeyboardAvoidingView behavior="padding">
        <View style={styles.field}>
          <TextInput
            autoCorrect={false}
            autoFocus
            style={styles.input}
            autoCapitalize="none"
            placeholder="Email"
            value={email}
            onChangeText={newEmail => this.setState({ email: newEmail })}
          />
        </View>
        <View style={styles.field}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={newPassword => this.setState({ password: newPassword })}
          />
        </View>
        <View style={styles.field}>
          <Button
            text="Sign in"
            progress={pendingServerResponse}
            onPress={this.onSignIn}
          />
        </View>
        <ErrorMsg errors={errors} />
      </KeyboardAvoidingView>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  email: state.auth.get('email'),
  password: state.auth.get('password'),
  pendingServerResponse: state.app.get('pendingServerResponse'),
  errors: state.errors.filter(e => e.active && e.type === LOGIN_FAILED),
});

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators({
    attemptLogin,
    markErrorsAsHandled,
  }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PasswordAuthScreen);
