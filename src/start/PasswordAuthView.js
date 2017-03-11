import React from 'react';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import OnePassword from 'react-native-onepassword';

import boundActions from '../boundActions';
import styles from '../common/styles';
import { fetchApiKey } from '../api';
import config from '../config';
import { ErrorMsg, ZulipButton, Input } from '../common';
import { getAuth } from '../account/accountSelectors';
import OnePasswordButton from './OnePasswordButton';

type Props = {
  realm: string,
};

const secondaryStyles = StyleSheet.create({
  passwordField: {
    justifyContent: 'flex-end',
  }
});

class PasswordAuthView extends React.Component {

  props: Props;

  state: {
    progress: boolean,
    email: string,
    password: string,
    error: string,
    onePasswordSupported: boolean,
  }

  constructor(props: Props) {
    super(props);
    this.state = {
      progress: false,
      email: props.email || config.defaultLoginEmail,
      password: props.password || config.defaultLoginPassword,
      onePasswordSupported: false,
    };
  }

  componentWillMount() {
    OnePassword.isSupported()
      .then(
        () => {
          console.log('OnePassword app is installed and ready!');
          this.setState({ onePasswordSupported: true });
        },
        () => {
          console.log('OnePassword not available.');
          this.setState({ onePasswordSupported: false });
        }
      );
  }
  findOnePasswordLogin = () => {
    OnePassword.findLogin(this.props.realm)
      .then((credentials) => {
        this.setState({ email: credentials.username, password: credentials.password });
      });
  };

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
        error: 'The email or password you entered is incorrect',
      });
    }
  };

  validateForm = () => {
    const { email, password } = this.state;

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      this.setState({ error: 'Please enter a valid email address' });
    } else if (!password) {
      this.setState({ error: 'Please enter your password' });
    } else {
      this.tryPasswordLogin();
    }
  };

  render() {
    const { email, password, progress, error } = this.state;

    return (
      <View>
        <Input
          customStyle={styles.field}
          autoCorrect={false}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="Email"
          defaultValue={email}
          onChangeText={newEmail => this.setState({ email: newEmail })}
          blurOnSubmit={false}
        />
        <Input
          customStyle={[styles.field, secondaryStyles.passwordField]}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={newPassword => this.setState({ password: newPassword })}
          blurOnSubmit={false}
        >
          <OnePasswordButton
            hidden={!this.state.onePasswordSupported}
            handlePress={this.findOnePasswordLogin}
          />
        </Input>

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
    password: getAuth(state).password,
  }),
  boundActions,
)(PasswordAuthView);
