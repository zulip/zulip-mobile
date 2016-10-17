import React from 'react';
import {
  TextInput,
} from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import config from '../config';
import { styles, Screen, ErrorMsg, Button } from '../common';
import { getAuth } from '../accountlist/accountlistSelectors';
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
    const { errors, pendingServerResponse, onBack } = this.props;
    const { email, password } = this.state;

    return (
      <Screen title="Login" keyboardAvoiding onBack={onBack}>
        <TextInput
          autoCorrect={false}
          autoFocus
          style={styles.input}
          autoCapitalize="none"
          placeholder="Email"
          value={email}
          onChangeText={newEmail => this.setState({ email: newEmail })}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={newPassword => this.setState({ password: newPassword })}
        />
        <Button
          text="Sign in"
          progress={pendingServerResponse}
          onPress={this.onSignIn}
        />
        <ErrorMsg errors={errors} />
      </Screen>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: getAuth(state),
  email: getAuth(state).get('email'),
  password: getAuth(state).get('password'),
  pendingServerResponse: state.app.get('pendingServerResponse'),
  errors: state.errors.filter(e => e.active && e.type === LOGIN_FAILED),
});

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators({
    attemptLogin,
    markErrorsAsHandled,
  }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PasswordAuthScreen);
