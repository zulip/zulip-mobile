/* @flow */
import React, { Component } from 'react';
import { Linking } from 'react-native';
import parseURL from 'url-parse';

import type { Actions } from '../types';
import connectWithActions from '../connectWithActions';
import { ZulipButton } from '../common';
import { getCurrentRealm } from '../selectors';
import { extractApiKey } from '../utils/encoding';
import { generateOtp, openBrowser, closeBrowser } from './oauth';

type Props = {
  actions: Actions,
  realm: string,
  name: string,
  Icon: Object,
  url: string,
};

let otp = '';

class OAuthView extends Component<Props> {
  static contextTypes = {
    styles: () => null,
  };

  props: Props;

  safariViewDismissEvent: Event;

  componentDidMount = () => {
    Linking.addEventListener('url', this.endOAuth);
    Linking.getInitialURL().then(url => {
      if (url) {
        this.endOAuth({ url });
      }
    });
  };

  componentWillUnmount = () => {
    Linking.removeEventListener('url', this.endOAuth);
  };

  beginOAuth = async url => {
    otp = await generateOtp();
    openBrowser(url, otp);
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

    if (!otp) {
      console.log('No one time pad stored. This auth redirect may not have been requested.'); // eslint-disable-line
      return;
    }

    if (!url.query.email || !url.query.otp_encrypted_api_key) {
      console.log('No credentials returned in server response.'); // eslint-disable-line
      return;
    }

    if (url.query.otp_encrypted_api_key.length !== otp.length) {
      console.log('API key in server response has the wrong length.'); // eslint-disable-line
      return;
    }

    const apiKey = extractApiKey(url.query.otp_encrypted_api_key, otp);
    actions.loginSuccess(realm, url.query.email, apiKey);
  };

  handleOAuth = () => {
    const { realm, url } = this.props;
    this.beginOAuth(`${realm}/${url}`);
  };

  render() {
    const { styles } = this.context;
    const { name, Icon } = this.props;

    return (
      <ZulipButton
        style={styles.smallMarginTop}
        secondary
        text={`Log in with ${name}`}
        Icon={Icon}
        onPress={this.handleOAuth}
      />
    );
  }
}

export default connectWithActions(state => ({
  realm: getCurrentRealm(state),
}))(OAuthView);
