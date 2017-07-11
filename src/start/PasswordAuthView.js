/* @flow */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import type { Actions, Auth } from '../types';
import boundActions from '../boundActions';
import { fetchApiKey } from '../api';
import config from '../config';
import { ErrorMsg, ZulipButton, Input, Touchable, Label } from '../common';
import { getAuth, getOwnEmail } from '../account/accountSelectors';
import openLink from '../utils/openLink';

type Props = {
  actions: Actions,
  auth: Auth,
  email: string,
};

const componentStyles = StyleSheet.create({
  container: {
    paddingBottom: 10,
  },
  linksTouchable: {
    alignItems: 'flex-end',
  }
});

class PasswordAuthView extends React.Component {

  static contextTypes = {
    styles: () => null,
  };

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
    const { auth, actions } = this.props;
    const { email, password } = this.state;

    this.setState({ progress: true, error: undefined });

    try {
      const apiKey = await fetchApiKey(auth, email, password);
      this.setState({ progress: false });
      actions.loginSuccess(auth.realm, email, apiKey);
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
    const { styles } = this.context;
    const { email, password, progress, error } = this.state;
    const { auth } = this.props;
    const forgotPasswordLink = `${auth.realm}/accounts/password/reset/`;
    return (
      <View style={componentStyles.container}>
        <Input
          style={styles.field}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          blurOnSubmit={false}
          keyboardType="email-address"
          placeholder="Email"
          defaultValue={email}
          onTextChange={newEmail => this.setState({ email: newEmail })}
        />
        <Input
          style={styles.field}
          placeholder="Password"
          secureTextEntry
          value={password}
          onTextChange={newPassword => this.setState({ password: newPassword })}
          blurOnSubmit={false}
          onSubmitEditing={this.validateForm}
        />
        <ZulipButton
          text="Sign in with password"
          progress={progress}
          onPress={this.validateForm}
        />
        <ErrorMsg error={error} />
        <Touchable style={componentStyles.linksTouchable}>
          <Label
            style={[styles.link]}
            onPress={() => openLink(forgotPasswordLink)}
            text="Forgot password?"
          />
        </Touchable>
      </View>
    );
  }
}

export default connect(
  (state) => ({
    auth: getAuth(state),
    email: getOwnEmail(state),
  }),
  boundActions,
)(PasswordAuthView);
