/* @flow */
import React from 'react';
import { Linking } from 'react-native';
import { connect } from 'react-redux';
import parseURL from 'url-parse';

import type { Actions } from '../types';
import boundActions from '../boundActions';
import { ZulipButton } from '../common';
import { getCurrentRealm } from '../selectors';
import { extractApiKey } from '../utils/encoding';
import { openBrowser, closeBrowser, generateOtp } from './oauth';

class OAuthView extends React.Component {
  static contextTypes = {
    styles: () => null,
  };

  props: {
    actions: Actions,
    realm: string,
  };

  otp: ?string;
  safariViewDismissEvent: Event;

  componentDidMount = () => {
    Linking.addEventListener('url', this.endOAuth);
  };

  componentWillUnmount = () => {
    Linking.removeEventListener('url', this.endOAuth);
  };

  beginOAuth = async url => {
    this.otp = await generateOtp();
    openBrowser(url, this.otp);
    // openBrowser(`${url}?mobile_flow_otp=${this.otp}`);
  };

  endOAuth = event => {
    closeBrowser();

    const { actions, realm } = this.props;
    const url = parseURL(event.url, true);

    // OAuth callback should have the following format:
    // zulip://login?realm={}&email={}&otp_encrypted_api_key={}
    if (url.host !== 'login') {
      return;
    }

    if (url.query.realm !== realm) {
      console.log('Zulip realm does not match request.'); // eslint-disable-line
      return;
    }

    if (!this.otp) {
      console.log('No one time pad stored. This auth redirect may not have been requested.'); // eslint-disable-line
      return;
    }

    if (!url.query.email || !url.query.otp_encrypted_api_key) {
      console.log('No credentials returned in server response.'); // eslint-disable-line
      return;
    }

    if (url.query.otp_encrypted_api_key.length !== this.otp.length) {
      console.log('API key in server response has the wrong length.'); // eslint-disable-line
      return;
    }

    const apiKey = extractApiKey(url.query.otp_encrypted_api_key, this.otp);
    actions.loginSuccess(realm, url.query.email, apiKey);
  };

  handleGoogleAuth = () => {
    const { realm } = this.props;
    this.beginOAuth(`${realm}/accounts/login/google/`);
  };

  render() {
    return (
      <ZulipButton
        secondary
        text="Sign in with Google"
        icon="logo-google"
        onPress={this.handleGoogleAuth}
      />
    );
  }
}

export default connect(
  state => ({
    realm: getCurrentRealm(state),
  }),
  boundActions,
)(OAuthView);
