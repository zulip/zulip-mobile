import React from 'react';
import { StyleSheet, Text, Image, View, ActivityIndicator } from 'react-native';
import GoogleSignIn from 'react-native-google-sign-in';

import Touchable from './Touchable';

const styles = StyleSheet.create({
  frame: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#aaa',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    marginTop: 5,
    marginBottom: 5,
  },
  logo: {
    width: 44,
    height: 44,
  },
  touchTarget: {
    flex: 1,
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'black',
    fontSize: 16,
  },
});

const ButtonInProgress = () => (
  <View style={styles.frame}>
    <ActivityIndicator color="white" />
  </View>
);

const ButtonNormal = ({ text, onPress }) => (
  <View style={styles.frame}>
    <Touchable
      style={styles.touchTarget}
      onPress={onPress}
    >
      <View style={styles.touchTarget}>
        <Image
          style={styles.logo}
          resizeMode="contain"
          source={require('../../static/img/google_auth_logo.png')}
        />
        <Text style={styles.text}>
          {text}
        </Text>
        <View style={styles.logo} />
      </View>
    </Touchable>
  </View>
);

export default class GoogleButton extends React.PureComponent {

  props: {
    progress: boolean,
    text: string,
    onPress: () => void,
  }

  async yourMethod() {
    await GoogleSignIn.configure({
      // // iOS
      // clientID: 'yourClientID',
      // // iOS, Android
      // // https://developers.google.com/identity/protocols/googlescopes
      // scopes: ['your', 'requested', 'api', 'scopes'],
      // // iOS, Android
      // // Whether to request email and basic profile.
      // // [Default: true]
      // // https://developers.google.com/identity/sign-in/ios/api/interface_g_i_d_sign_in.html#a06bf16b507496b126d25ea909d366ba4
      // shouldFetchBasicProfile: boolean,
      // // iOS
      // // https://developers.google.com/identity/sign-in/ios/api/interface_g_i_d_sign_in.html#a486c8df263ca799bea18ebe5430dbdf7
      // language: string,
      // // iOS
      // // https://developers.google.com/identity/sign-in/ios/api/interface_g_i_d_sign_in.html#a0a68c7504c31ab0b728432565f6e33fd
      // loginHint: string,
      // // iOS, Android
      // // https://developers.google.com/identity/sign-in/ios/api/interface_g_i_d_sign_in.html#ae214ed831bb93a06d8d9c3692d5b35f9
      // serverClientID: 'yourServerClientID',
      // // Android
      // // Whether to request server auth code. Make sure to provide `serverClientID`.
      // // https://developers.google.com/android/reference/com/google/android/gms/auth/api/signin/GoogleSignInOptions.Builder.html#requestServerAuthCode(java.lang.String, boolean)
      // offlineAccess: boolean,
      // // Android
      // // Whether to force code for refresh token.
      // // https://developers.google.com/android/reference/com/google/android/gms/auth/api/signin/GoogleSignInOptions.Builder.html#requestServerAuthCode(java.lang.String, boolean)
      // forceCodeForRefreshToken: boolean,
      // // iOS
      // // https://developers.google.com/identity/sign-in/ios/api/interface_g_i_d_sign_in.html#a211c074872cd542eda53f696c5eef871
      // openIDRealm: string,
      // // Android
      // // https://developers.google.com/android/reference/com/google/android/gms/auth/api/signin/GoogleSignInOptions.Builder.html#setAccountName(java.lang.String)
      // accountName: 'yourServerAccountName',
      // // iOS, Android
      // // https://developers.google.com/identity/sign-in/ios/api/interface_g_i_d_sign_in.html#a6d85d14588e8bf21a4fcf63e869e3be3
      // hostedDomain: 'yourHostedDomain',
    });

    const user = await GoogleSignIn.signInPromise();

    console.log(user);
  }

  render() {
    const { progress, onPress } = this.props;

    if (progress) {
      return <ButtonInProgress />;
    }

    return (
      <ButtonNormal
        text="Sign in with Google"
        onPress={onPress}
      />
    );
  }
}
