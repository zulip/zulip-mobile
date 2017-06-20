/* @flow */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import { Auth } from '../types';
import boundActions from '../boundActions';
import styles from '../styles';
import { fetchApiKey } from '../api';
import config from '../config';
import { ErrorMsg, ZulipButton, Input } from '../common';
import { getAuth } from '../account/accountSelectors';

type Props = {
  auth: Auth,
  loginSuccess: (realm: string, email: string, apiKey: string) => void,
  email: string,
};

const moreStyles = StyleSheet.create({
  container: {
    paddingBottom: 10,
  },
});

class PasswordAuthView extends React.Component {

  props: Props;

  state: {
    email: string,
    password: string,
    error: string,
    progress: boolean,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      progress: false,
      email: props.email || config.defaultLoginEmail,
      password: config.defaultLoginPassword,
      error: ''
    };
  }

  tryPasswordLogin = async () => {
    const { auth, loginSuccess } = this.props;
    const { email, password } = this.state;

    this.setState({ progress: true, error: undefined });

    try {
      const apiKey = await fetchApiKey(auth, email, password);
      this.setState({ progress: false });
      loginSuccess(auth.realm, email, apiKey);
    } catch (err) {
      this.setState({
        progress: false,
        error: 'Wrong email or password. Try again.',
      });
    }
  };

  validateForm = () => {
    const { email, password } = this.state;

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      this.setState({ error: 'Enter a valid email address' });
    } else if (!password) {
      this.setState({ error: 'Enter a password' });
    } else {
      this.tryPasswordLogin();
    }
  };

  render() {
    const { email, password, progress, error } = this.state;

    return (
      <View style={moreStyles.container}>
        <Input
          style={styles.field}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          blurOnSubmit={false}
          keyboardType="email-address"
          placeholder="Email"
          defaultValue={email}
          onChangeText={newEmail => this.setState({ email: newEmail })}
        />
        <Input
          style={styles.field}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={newPassword => this.setState({ password: newPassword })}
          blurOnSubmit={false}
          onSubmitEditing={this.validateForm}
        />
        <ZulipButton
          text="Sign in with password"
          progress={progress}
          onPress={this.validateForm}
        />
        <ErrorMsg error={error} />
      </View>
    );
  }
}

export default connect(
  (state) => ({
    auth: getAuth(state),
    email: getAuth(state).email,
  }),
  boundActions,
)(PasswordAuthView);
