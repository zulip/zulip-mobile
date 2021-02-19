/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import type { Auth, Dispatch } from '../types';
import { createStyleSheet } from '../styles';
import { connect } from '../react-redux';
import * as api from '../api';
import {
  ErrorMsg,
  Input,
  PasswordInput,
  Screen,
  WebLink,
  ZulipButton,
  ViewPlaceholder,
} from '../common';
import { getPartialAuth } from '../selectors';
import { isValidEmailFormat } from '../utils/misc';
import { loginSuccess } from '../actions';

const styles = createStyleSheet({
  linksTouchable: {
    alignItems: 'flex-end',
  },
});

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'password-auth'>,
  route: RouteProp<'password-auth', {| requireEmailFormat: boolean |}>,

  partialAuth: Auth,
  dispatch: Dispatch,
|}>;

type State = {|
  email: string,
  password: string,
  error: string,
  progress: boolean,
|};

class PasswordAuthScreen extends PureComponent<Props, State> {
  state = {
    progress: false,
    email: '',
    password: '',
    error: '',
  };

  tryPasswordLogin = async () => {
    const { dispatch, partialAuth, route } = this.props;
    const { requireEmailFormat } = route.params;
    const { email, password } = this.state;

    this.setState({ progress: true, error: undefined });

    try {
      const fetchedKey = await api.fetchApiKey(partialAuth, email, password);
      this.setState({ progress: false });
      dispatch(loginSuccess(partialAuth.realm, fetchedKey.email, fetchedKey.api_key));
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
    const { requireEmailFormat } = this.props.route.params;
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
    const { requireEmailFormat } = this.props.route.params;
    const { email, password, progress, error } = this.state;
    const isButtonDisabled =
      password.length === 0
      || email.length === 0
      || (requireEmailFormat && !isValidEmailFormat(email));

    return (
      <Screen
        title="Log in"
        centerContent
        padding
        keyboardShouldPersistTaps="always"
        shouldShowLoadingBanner={false}
      >
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
        <ViewPlaceholder height={8} />
        <PasswordInput
          autoFocus={email.length !== 0}
          placeholder="Password"
          value={password}
          onChangeText={newPassword => this.setState({ password: newPassword })}
          blurOnSubmit={false}
          onSubmitEditing={this.validateForm}
        />
        <ViewPlaceholder height={16} />
        <ZulipButton
          disabled={isButtonDisabled}
          text="Log in"
          progress={progress}
          onPress={this.validateForm}
        />
        <ErrorMsg error={error} />
        <View style={styles.linksTouchable}>
          <WebLink label="Forgot password?" href="/accounts/password/reset/" />
        </View>
      </Screen>
    );
  }
}

export default connect(state => ({
  partialAuth: getPartialAuth(state),
}))(PasswordAuthScreen);
