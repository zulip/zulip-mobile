import React from 'react';
import { StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { GoogleSignin, GoogleSigninButton } from 'react-native-google-signin';

import boundActions from '../boundActions';
import { Screen } from '../common';
import { getAuth } from '../account/accountSelectors';

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
  },
});

class GoogleAuthScreen extends React.Component {

  state = {
    progress: false,
  };

  trySignin = () => {
    GoogleSignin.configure({
      iosClientId: 123, // <FROM DEVELOPER CONSOLE>, // only for iOS
    })
    .then(() => {
      // you can now call currentUserAsync()
    });
  }

  render() {
    return (
      <Screen title="Login with Google" keyboardAvoiding>
        <GoogleSigninButton
          style={styles.button}
          size={GoogleSigninButton.Size.Icon}
          color={GoogleSigninButton.Color.Dark}
          onPress={this.trySignin}
        />
      </Screen>
    );
  }
}

export default connect(
  (state) => ({
    auth: getAuth(state),
  }),
  boundActions,
)(GoogleAuthScreen);
