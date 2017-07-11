/* @flow */
import React from 'react';
import { Linking, Platform, View } from 'react-native';
import { connect } from 'react-redux';

import SafariView from 'react-native-safari-view';
import parseURL from 'url-parse';

import type { Actions } from '../types';
import boundActions from '../boundActions';
import { RawLabel, Screen, ZulipButton } from '../common';
import { generateOtp, extractApiKey } from '../utils/encoding';
import { getCurrentRealm } from '../account/accountSelectors';

import PasswordAuthView from './PasswordAuthView';

class AuthScreen extends React.PureComponent {

  static contextTypes = {
    styles: () => null,
  };

  props: {
    actions: Actions,
    authBackends: string[],
    realm: string,
  };

  otp: ?string;
  safariViewDismissEvent: Event;

  componentDidMount = () => {
    // Add listeners for OAuth flow
    if (Platform.OS === 'ios') {
      Linking.addEventListener('url', this.endOAuthFlow);
      this.safariViewDismissEvent = SafariView.addEventListener('onDismiss', () => {
        this.otp = undefined;
      });
    }
  }

  componentWillUnmount = () => {
    // Remove listeners for OAuth flow
    if (Platform.OS === 'ios') {
      Linking.removeEventListener('url', this.endOAuthFlow);
      SafariView.removeEventListener('onDismiss', this.safariViewDismissEvent);
    }
  }

  handleTypeSelect = (authType: string) => {
    const { actions, realm } = this.props;

    if (authType === 'google') {
      // Google OAuth flow
      this.beginOAuthFlow(`${realm}/accounts/login/google/`);
    } else if (authType === 'github') {
      // Github OAuth flow
      this.beginOAuthFlow(`${realm}/accounts/login/social/github/`);
    } else {
      // Password auth flow
      actions.setAuthType(authType);
      actions.pushRoute(authType);
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
    const { actions, realm } = this.props;

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

      // If we have made it this far we have a valid API key
      const apiKey = extractApiKey(query.otp_encrypted_api_key, this.otp);

      // Reset stored one time pad
      this.otp = undefined;

      // Add the authenticated account
      actions.loginSuccess(realm, query.email, apiKey);
    }
  }

  shouldShowOAuth = () =>
    // OAuth flow only supports iOS 9+ right now
    Platform.OS === 'ios' && !Platform.Version.startsWith('8.');

  render() {
    const { styles } = this.context;
    const { authBackends } = this.props;

    return (
      <Screen title="Sign in" keyboardAvoiding>
        <View style={styles.container}>
          <RawLabel
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
            <ZulipButton
              secondary
              text="Sign in with Google"
              icon="logo-google"
              onPress={() => this.handleTypeSelect('google')}
            />
          }
        </View>
      </Screen>
    );
  }
}

export default connect(
  (state) => ({
    realm: getCurrentRealm(state),
  }),
  boundActions,
)(AuthScreen);
