/* @flow */
import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';

import type { Actions, Auth } from '../types';
import connectWithActions from '../connectWithActions';
import { fetchApiKey } from '../api';
import { ErrorMsg, ZulipButton, Input, PasswordInput, WebLink } from '../common';
import { getAuth, getOwnEmail } from '../selectors';

const componentStyles = StyleSheet.create({
  container: {
    paddingBottom: 10,
  },
  linksTouchable: {
    alignItems: 'flex-end',
  },
});

type Props = {
  actions: Actions,
  auth: Auth,
  email: string,
  ldap: boolean,
};

type State = {
  email: string,
  password: string,
  error: string,
  progress: boolean,
};

class PasswordAuthView extends PureComponent<Props, State> {
  static contextTypes = {
    styles: () => null,
  };

  props: Props;

  state: State;

  state = {
    progress: false,
    email: '',
    password: '',
    error: '',
  };

  tryPasswordLogin = async () => {
    const { actions, auth, ldap } = this.props;
    const { email, password } = this.state;

    this.setState({ progress: true, error: undefined });

    try {
      const fetchedKey = await fetchApiKey(auth, email, password);
      this.setState({ progress: false });
      actions.loginSuccess(auth.realm, fetchedKey.email, fetchedKey.api_key);
    } catch (err) {
      this.setState({
        progress: false,
        error: ldap
          ? 'Wrong username or password. Try again.'
          : 'Wrong email or password. Try again.',
      });
    }
  };

  validateForm = () => {
    const { ldap } = this.props;
    const { email, password } = this.state;

    if (!email || (!ldap && !/\S+@\S+\.\S+/.test(email))) {
      this.setState({ error: ldap ? 'Enter a username' : 'Enter a valid email address' });
    } else if (!password) {
      this.setState({ error: 'Enter a password' });
    } else {
      this.tryPasswordLogin();
    }
  };

  render() {
    const { styles } = this.context;
    const { ldap } = this.props;
    const { email, password, progress, error } = this.state;

    return (
      <View style={componentStyles.container}>
        <Input
          style={styles.smallMarginTop}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          blurOnSubmit={false}
          keyboardType={ldap ? 'default' : 'email-address'}
          placeholder={ldap ? 'Username' : 'Email'}
          defaultValue={email}
          onChangeText={newEmail => this.setState({ email: newEmail })}
        />
        <PasswordInput
          style={[styles.smallMarginTop, styles.field]}
          placeholder="Password"
          value={password}
          onChangeText={newPassword => this.setState({ password: newPassword })}
          blurOnSubmit={false}
          onSubmitEditing={this.validateForm}
        />
        <ZulipButton
          style={styles.smallMarginTop}
          text="Log in"
          progress={progress}
          onPress={this.validateForm}
        />
        <ErrorMsg error={error} />
        <View style={componentStyles.linksTouchable}>
          <WebLink label="Forgot password?" href="/accounts/password/reset/" />
        </View>
      </View>
    );
  }
}

export default connectWithActions(state => ({
  auth: getAuth(state),
  email: getOwnEmail(state),
}))(PasswordAuthView);
