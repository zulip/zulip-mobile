/* @flow */
import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';

import type { Actions, Auth } from '../types';
import connectWithActions from '../connectWithActions';
import { fetchApiKey } from '../api';
import { ErrorMsg, Input, PasswordInput, Screen, WebLink, ZulipButton } from '../common';
import { getAuth } from '../selectors';
import { isValidEmailFormat } from '../utils/misc';

const componentStyles = StyleSheet.create({
  linksTouchable: {
    alignItems: 'flex-end',
  },
});

type Props = {
  actions: Actions,
  auth: Auth,
  navigation: Object,
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
    email: this.props.auth.email || '',
    password: '',
    error: '',
  };

  tryPasswordLogin = async () => {
    const { actions, auth, navigation } = this.props;
    const { ldap } = navigation.state.params;
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
    const { ldap } = this.props.navigation.state.params;
    const { email, password } = this.state;

    if (ldap && email.length === 0) {
      this.setState({ error: 'Enter a username' });
    } else if (!ldap && !isValidEmailFormat(email)) {
      this.setState({ error: 'Enter a valid email address' });
    } else if (!password) {
      this.setState({ error: 'Enter a password' });
    } else {
      this.tryPasswordLogin();
    }
  };

  render() {
    const { styles } = this.context;
    const { ldap } = this.props.navigation.state.params;
    const { email, password, progress, error } = this.state;
    const isButtonDisabled =
      password.length === 0 || email.length === 0 || (!ldap && !isValidEmailFormat(email));

    return (
      <Screen title="Log in" centerContent padding keyboardShouldPersistTaps="always">
        <Input
          style={styles.halfMarginTop}
          autoFocus={email.length === 0}
          autoCapitalize="none"
          autoCorrect={false}
          blurOnSubmit={false}
          keyboardType={ldap ? 'default' : 'email-address'}
          placeholder={ldap ? 'Username' : 'Email'}
          defaultValue={email}
          onChangeText={newEmail => this.setState({ email: newEmail })}
        />
        <PasswordInput
          style={[styles.halfMarginTop, styles.field]}
          autoFocus={email.length !== 0}
          placeholder="Password"
          value={password}
          onChangeText={newPassword => this.setState({ password: newPassword })}
          blurOnSubmit={false}
          onSubmitEditing={this.validateForm}
        />
        <ZulipButton
          style={styles.halfMarginTop}
          disabled={isButtonDisabled}
          text="Log in"
          progress={progress}
          onPress={this.validateForm}
        />
        <ErrorMsg error={error} />
        <View style={componentStyles.linksTouchable}>
          <WebLink label="Forgot password?" href="/accounts/password/reset/" />
        </View>
      </Screen>
    );
  }
}

export default connectWithActions(state => ({
  auth: getAuth(state),
}))(PasswordAuthView);
