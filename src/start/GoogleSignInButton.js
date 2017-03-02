import React from 'react';
import { connect } from 'react-redux';
import GoogleSignIn from 'react-native-google-sign-in';

import boundActions from '../boundActions';
import { ZulipButton } from '../common';
import { fetchApiKey } from '../api';
import { getAuth } from '../account/accountSelectors';

class GoogleSignInButton extends React.PureComponent {

  state = {
    progress: false,
  };

  props: {
    progress: boolean,
    text: string,
    onPress: () => void,
  }

  handleSignIn = async () => {
    const { auth, loginSuccess } = this.props;
    this.setState({ progress: true });
    try {
      const user = await GoogleSignIn.signInPromise();
      console.log('accessToken and idToken', user.accessToken, user.idToken);
      const apiKey = await fetchApiKey(auth, 'google-oauth2-token', user.idToken);
      loginSuccess(auth.realm, user.email, apiKey);
    } catch (err) {
      console.log(err);
      this.setState({
        progress: false,
        error: 'The email or password you entered is incorrect',
      });
    }
  }

  render() {
    return (
      <ZulipButton
        secondary
        progress={this.state.progress}
        image={require('../../static/img/google_auth_logo.png')}
        text="Sign in with Google"
        onPress={this.handleSignIn}
      />
    );
  }
}


export default connect(
  (state) => ({
    auth: getAuth(state),
  }),
  boundActions,
)(GoogleSignInButton);
