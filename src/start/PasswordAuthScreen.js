/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { ComponentType } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import type { Dispatch } from '../types';
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
  RawLabel,
} from '../common';
import { isValidEmailFormat } from '../utils/misc';
import { loginSuccess } from '../actions';

const styles = createStyleSheet({
  linksTouchable: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  forgotPasswordText: {
    textAlign: 'right',
  },
});

type OuterProps = $ReadOnly<{|
  // These should be passed from React Navigation
  navigation: AppNavigationProp<'password-auth'>,
  route: RouteProp<'password-auth', {| realm: URL, requireEmailFormat: boolean |}>,
|}>;

type SelectorProps = $ReadOnly<{||}>;

type Props = $ReadOnly<{|
  ...OuterProps,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

type State = {|
  email: string,
  password: string,
  error: string,
  progress: boolean,
|};

/**
 * A screen with email and password inputs, to log in that way.
 *
 * Pads the horizontal insets with its background.
 */
class PasswordAuthScreenInner extends PureComponent<Props, State> {
  state = {
    progress: false,
    email: '',
    password: '',
    error: '',
  };

  tryPasswordLogin = async () => {
    const { dispatch, route } = this.props;
    const { requireEmailFormat, realm } = route.params;
    const { email, password } = this.state;

    this.setState({ progress: true, error: undefined });

    try {
      const fetchedKey = await api.fetchApiKey({ realm, apiKey: '', email }, email, password);
      this.setState({ progress: false });
      dispatch(loginSuccess(realm, fetchedKey.email, fetchedKey.api_key));
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
    const { requireEmailFormat, realm } = this.props.route.params;
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
        <SafeAreaView mode="padding" edges={['right', 'left']}>
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
            <RawLabel style={styles.forgotPasswordText}>
              <WebLink label="Forgot password?" url={new URL('/accounts/password/reset/', realm)} />
            </RawLabel>
          </View>
        </SafeAreaView>
      </Screen>
    );
  }
}

const PasswordAuthScreen: ComponentType<OuterProps> = connect<{||}, _, _>()(
  PasswordAuthScreenInner,
);

export default PasswordAuthScreen;
