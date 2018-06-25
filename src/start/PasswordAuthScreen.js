/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';

import type { Auth, Context, Dispatch, GlobalState } from '../types';
import { fetchApiKey } from '../api';
import { ErrorMsg, Input, PasswordInput, Screen, WebLink, ZulipButton } from '../common';
import { getAuth } from '../selectors';
import { isValidEmailFormat } from '../utils/misc';
import { loginSuccess } from '../actions';

const componentStyles = StyleSheet.create({
  linksTouchable: {
    alignItems: 'flex-end',
  },
});

type Props = {
  auth: Auth,
  dispatch: Dispatch,
  navigation: Object,
};

type State = {
  email: string,
  password: string,
  error: string,
  progress: boolean,
};

class PasswordAuthScreen extends PureComponent<Props, State> {
  context: Context;
  props: Props;
  state: State = {
    progress: false,
    email: this.props.auth.email || '',
    password: '',
    error: '',
  };

  static contextTypes = {
    styles: () => null,
  };

  tryPasswordLogin = async () => {
    const { dispatch, auth, navigation } = this.props;
    const { requireEmailFormat } = navigation.state.params;
    const { email, password } = this.state;

    this.setState({ progress: true, error: undefined });

    try {
      const fetchedKey = await fetchApiKey(auth, email, password);
      this.setState({ progress: false });
      dispatch(loginSuccess(auth.realm, fetchedKey.email, fetchedKey.api_key));
    } catch (err) {
      this.setState({
        progress: false,
        error: requireEmailFormat
          ? 'Wrong email or password. Try again.'
          : 'Wrong username or password. Try again.',
      });
    }
  };

  validateForm = () => {
    const { requireEmailFormat } = this.props.navigation.state.params;
    const { email, password } = this.state;

    if (requireEmailFormat && !isValidEmailFormat(email)) {
      this.setState({ error: 'Enter a valid email address' });
    } else if (!requireEmailFormat && email.length === 0) {
      this.setState({ error: 'Enter a username' });
    } else if (!password) {
      this.setState({ error: 'Enter a password' });
    } else {
      this.tryPasswordLogin();
    }
  };

  render() {
    const { styles } = this.context;
    const { requireEmailFormat } = this.props.navigation.state.params;
    const { email, password, progress, error } = this.state;
    const isButtonDisabled =
      password.length === 0
      || email.length === 0
      || (requireEmailFormat && !isValidEmailFormat(email));

    return (
      <Screen title="Log in" centerContent padding keyboardShouldPersistTaps="always">
        <Input
          autoFocus={email.length === 0}
          autoCapitalize="none"
          autoCorrect={false}
          blurOnSubmit={false}
          keyboardType={requireEmailFormat ? 'email-address' : 'default'}
          placeholder={requireEmailFormat ? 'Email' : 'Username'}
          defaultValue={email}
          onChangeText={newEmail => this.setState({ email: newEmail })}
        />
        <PasswordInput
          style={styles.halfMarginTop}
          autoFocus={email.length !== 0}
          placeholder="Password"
          value={password}
          onChangeText={newPassword => this.setState({ password: newPassword })}
          blurOnSubmit={false}
          onSubmitEditing={this.validateForm}
        />
        <ZulipButton
          style={styles.marginTop}
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

export default connect((state: GlobalState) => ({
  auth: getAuth(state),
}))(PasswordAuthScreen);
