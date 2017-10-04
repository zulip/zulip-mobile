/* @flow */
import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import type { Actions, Auth } from '../types';
import boundActions from '../boundActions';
import { fetchApiKey } from '../api';
import { ErrorMsg, ZulipButton, Input, PasswordInput, WebLink } from '../common';
import { getAuth, getOwnEmail } from '../selectors';

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
  },
});

class PasswordAuthView extends PureComponent {
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
      email: props.email,
      password: '',
      error: '',
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

    return (
      <View style={componentStyles.container}>
        <Input
          style={styles.smallMarginTop}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          blurOnSubmit={false}
          keyboardType="email-address"
          placeholder="Email"
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
          text="Sign in"
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

export default connect(
  state => ({
    auth: getAuth(state),
    email: getOwnEmail(state),
  }),
  boundActions,
)(PasswordAuthView);
