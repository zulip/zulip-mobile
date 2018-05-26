/* @flow */
import React, { PureComponent } from 'react';
import { Linking } from 'react-native';
import parseURL from 'url-parse';

import type { Actions } from '../types';
import connectWithActions from '../connectWithActions';
import { Centerer, Screen } from '../common';
import { getCurrentRealm } from '../selectors';
import RealmInfo from './RealmInfo';
import AuthButton from './AuthButton';
import { getFullUrl } from '../utils/url';
import { extractApiKey } from '../utils/encoding';
import { generateOtp, openBrowser, closeBrowser } from './oauth';
import { activeAuthentications } from './authentications';

type Props = {
  actions: Actions,
  realm: string,
  navigation: Object,
};

let otp = '';

class AuthScreen extends PureComponent<Props> {
  props: Props;

  componentDidMount = () => {
    Linking.addEventListener('url', this.endOAuth);
    Linking.getInitialURL().then(initialUrl => {
      if (initialUrl) {
        this.endOAuth({ url: initialUrl });
      }
    });

    const authList = activeAuthentications(
      this.props.navigation.state.params.serverSettings.authentication_methods,
    );
    if (authList.length === 1) {
      // $FlowFixMe
      this[authList[0].handler]();
    }
  };

  componentWillUnmount = () => {
    Linking.removeEventListener('url', this.endOAuth);
  };

  beginOAuth = async url => {
    otp = await generateOtp();
    openBrowser(`${this.props.realm}/${url}`, otp);
  };

  endOAuth = event => {
    closeBrowser();

    const { actions, realm } = this.props;
    const url = parseURL(event.url, true);

    // callback format expected: zulip://login?realm={}&email={}&otp_encrypted_api_key={}
    if (
      url.host === 'login'
      && url.query.realm === realm
      && otp
      && url.query.email
      && url.query.otp_encrypted_api_key
      && url.query.otp_encrypted_api_key.length === otp.length
    ) {
      const apiKey = extractApiKey(url.query.otp_encrypted_api_key, otp);
      actions.loginSuccess(realm, url.query.email, apiKey);
    }
  };

  handleDevAuth = () => {
    this.props.actions.navigateToDev();
  };

  handlePassword = () => {
    const { serverSettings } = this.props.navigation.state.params;
    this.props.actions.navigateToPassword(serverSettings.require_email_format_usernames);
  };

  handleGoogle = () => {
    this.beginOAuth('accounts/login/google/');
  };

  handleGitHub = () => {
    this.beginOAuth('accounts/login/social/github');
  };

  handleSso = () => {
    this.beginOAuth('accounts/login/sso');
  };

  render() {
    const { serverSettings } = this.props.navigation.state.params;

    return (
      <Screen title="Log in" centerContent padding>
        <Centerer>
          <RealmInfo
            name={serverSettings.realm_name}
            iconUrl={getFullUrl(serverSettings.realm_icon, this.props.realm)}
          />
          {activeAuthentications(serverSettings.authentication_methods).map(auth => (
            <AuthButton
              key={auth.method}
              name={auth.name}
              Icon={auth.Icon}
              onPress={
                // $FlowFixMe
                this[auth.handler]
              }
            />
          ))}
        </Centerer>
      </Screen>
    );
  }
}

export default connectWithActions(state => ({
  realm: getCurrentRealm(state),
}))(AuthScreen);
