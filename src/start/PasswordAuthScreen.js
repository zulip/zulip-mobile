import React from 'react';
import { TextInput } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { fetchApiKey } from '../api';
import config from '../config';
import { styles, Screen, ErrorMsg, Button } from '../common';
import { getAuth } from '../account/accountSelectors';
import { loginSuccess } from '../account/accountActions';

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
    const { auth } = this.props;
    const { email, password } = this.state;

    this.setState({ progress: true, error: undefined });

    try {
      const apiKey = await fetchApiKey(auth, email, password);
      this.props.loginSuccess(auth.get('realm'), email, apiKey);
      this.setState({ progress: false });
    } catch (err) {
      this.setState({ progress: false, error: err.message });
    }
  };

  render() {
    const { onBack } = this.props;
    const { email, password, progress, error } = this.state;

    return (
      <Screen title="Login" keyboardAvoiding onBack={onBack}>
        <TextInput
          autoCorrect={false}
          autoFocus
          style={styles.input}
          autoCapitalize="none"
          placeholder="Email"
          value={email}
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

const mapStateToProps = (state) => ({
  auth: getAuth(state),
  email: getAuth(state).get('email'),
  password: getAuth(state).get('password'),
});

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators({
    loginSuccess,
  }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PasswordAuthScreen);
