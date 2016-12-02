import React from 'react';
import { TextInput } from 'react-native';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { fetchApiKey } from '../api';
import config from '../config';
import { styles, Screen, ErrorMsg, Button } from '../common';
import { getAuth } from '../account/accountSelectors';

type Props = {};

class PasswordAuthScreen extends React.Component {

  props: Props;

  state: {
    progress: boolean,
    email: string,
    password: string,
    error: string,
  }

  constructor(props: Props) {
    super(props);
    this.state = {
      progress: false,
      email: props.email || config.defaultLoginEmail,
      password: props.password || config.defaultLoginPassword,
    };
  }

  tryPasswordLogin = async () => {
    const { auth, loginSuccess } = this.props;
    const { email, password } = this.state;

    this.setState({ progress: true, error: undefined });

    try {
      const apiKey = await fetchApiKey(auth, email, password);
      loginSuccess(auth.realm, email, apiKey);
      this.setState({ progress: false });
    } catch (err) {
      this.setState({ progress: false, error: err.message });
    }
  };

  render() {
    const { email, password, progress, error } = this.state;

    return (
      <Screen title="Login" keyboardAvoiding>
        <TextInput
          autoCorrect={false}
          autoFocus
          style={styles.input}
          autoCapitalize="none"
          placeholder="Email"
          defaultValue={email}
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
          progress={progress}
          onPress={this.tryPasswordLogin}
        />
        <ErrorMsg error={error} />
      </Screen>
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
)(PasswordAuthScreen);
