import React from 'react';
import { Linking, Platform, ScrollView, View } from 'react-native';
import { connect } from 'react-redux';
import DeviceInfo from 'react-native-device-info';

import SafariView from 'react-native-safari-view';
import parseURL from 'url-parse';

import boundActions from '../boundActions';
import styles from '../styles';
import { RawLabel, Screen, ZulipButton, GoogleButton } from '../common';
import { generateOtp, extractApiKey } from '../utils/encoding';
import { getAuth } from '../account/accountSelectors';

import PasswordAuthView from './PasswordAuthView';

class AuthScreen extends React.PureComponent {

  props: {
    authBackends: string[],
  };

  componentDidMount = () => {
    // Add listeners for OAuth flow
    Linking.addEventListener('url', this.endOAuthFlow);
    this.safariViewDismissEvent = SafariView.addEventListener('onDismiss', () => {
      this.otp = undefined;
    });
  }

  componentWillUnmount = () => {
    // Remove listeners for OAuth flow
    Linking.removeEventListener('url', this.endOAuthFlow);
    SafariView.removeEventListener('onDismiss', this.safariViewDismissEvent);
  }

  handleTypeSelect = (authType: string) => {
    const { realm } = this.props;

    if (authType === 'google') {
      // Google OAuth flow
      this.beginOAuthFlow(`${realm}/accounts/login/google/`);
    } else if (authType === 'github') {
      // Github OAuth flow
      this.beginOAuthFlow(`${realm}/accounts/login/social/github/`);
    } else {
      // Password auth flow
      this.props.setAuthType(authType);
      this.props.pushRoute(authType);
    }
  }

  beginOAuthFlow = async (url) => {
    // Generate a one time pad (OTP) to send up with the request
    // The server XORs the API key with this OTP in its response to protect
    // against malicious apps registering an identical URI scheme and trying
    // to intercept credentials
    this.otp = await generateOtp();
    SafariView.show({ url: `${url}?mobile_flow_otp=${this.otp}` });
  };

  endOAuthFlow = (event) => {
    const { realm, loginSuccess } = this.props;

    SafariView.dismiss();

    const url = parseURL(event.url, true);

    // The OAuth callback should have the following format:
    // zulip://login?realm={}&email={}&otp_encrypted_api_key={}
    if (url.host === 'login') {
      const query = url.query;

      // Check for errors
      if (query.realm !== realm) {
        // eslint-disable-next-line no-console
        console.error('Zulip realm does not match request.');
        return;
      }

      if (!this.otp) {
        // eslint-disable-next-line no-console
        console.error('No one time pad stored. This auth redirect may not have been requested.');
        return;
      }

      if (!query.email || !query.otp_encrypted_api_key) {
        // eslint-disable-next-line no-console
        console.error('No credentials returned in server response.');
        return;
      }

      if (query.otp_encrypted_api_key.length !== this.otp.length) {
        // eslint-disable-next-line no-console
        console.error('API key in server response has the wrong length.');
        return;
      }

      // If we've made it this far we have a valid API key
      const apiKey = extractApiKey(query.otp_encrypted_api_key, this.otp);

      // Reset stored one time pad
      this.otp = undefined;

      // Add the authenticated account
      loginSuccess(realm, query.email, apiKey);
    }
  }

  shouldShowOAuth = () =>
    // OAuth flow only supports iOS 9+ right now
    Platform.OS === 'ios' && parseFloat(DeviceInfo.getSystemVersion()) >= 9.0;

  render() {
    const { authBackends } = this.props;

    return (
      <Screen title="Sign in" keyboardAvoiding>
        <ScrollView
          ref={(scrollView) => { this.scrollView = scrollView; }}
          centerContent
          keyboardShouldPersistTaps="always"
          onContentSizeChange={() => this.scrollView.scrollToEnd({ animated: true })}
        >
          <View style={styles.container}>
            <RawLabel
              style={[styles.field]}
              text={this.props.realm}
              editable={false}
            />
            {authBackends.includes('dev') &&
              <ZulipButton
                text="Sign in with dev account"
                onPress={() => this.handleTypeSelect('dev')}
              />
            }
            {authBackends.includes('password') && <PasswordAuthView />}
            {authBackends.includes('google') && this.shouldShowOAuth() &&
              <GoogleButton
                onPress={() => this.handleTypeSelect('google')}
              />
            }
          </View>
        </ScrollView>
      </Screen>
    );
  }
}

export default connect(
  (state) => ({
    realm: getAuth(state).realm,
  }),
  boundActions,
)(AuthScreen);
