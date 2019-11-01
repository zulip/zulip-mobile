/* @flow strict-local */

import React, { PureComponent } from 'react';
import { Linking } from 'react-native';
import parseURL from 'url-parse';
import type { NavigationScreenProp } from 'react-navigation';

import type { Dispatch, ApiResponseServerSettings } from '../types';
import { connect } from '../react-redux';
import styles from '../styles';
import { Centerer, Screen, ZulipButton } from '../common';
import { getCurrentRealm } from '../selectors';
import RealmInfo from './RealmInfo';
import { getFullUrl } from '../utils/url';
import { extractApiKey } from '../utils/encoding';
import { generateOtp, openBrowser, closeBrowser } from './oauth';
import { activeAuthentications } from './authentications';
import { loginSuccess, navigateToDev, navigateToPassword } from '../actions';

type Props = $ReadOnly<{|
  dispatch: Dispatch,
  realm: string,
  navigation: NavigationScreenProp<{ params: {| serverSettings: ApiResponseServerSettings |} }>,
|}>;

let otp = '';

/**
 * An event emitted by `Linking`.
 *
 * Determined by reading the implementation source code, and documentation:
 *   https://facebook.github.io/react-native/docs/linking
 *
 * TODO move this to a libdef, and/or get an explicit type into upstream.
 */
type LinkingEvent = {
  url: string,
};

class AuthScreen extends PureComponent<Props> {
  componentDidMount = () => {
    Linking.addEventListener('url', this.endOAuth);
    Linking.getInitialURL().then((initialUrl: ?string) => {
      if (initialUrl !== null && initialUrl !== undefined) {
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

  beginOAuth = async (url: string) => {
    otp = await generateOtp();
    openBrowser(`${this.props.realm}/${url}`, otp);
  };

  endOAuth = (event: LinkingEvent) => {
    closeBrowser();

    const { dispatch, realm } = this.props;
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
      dispatch(loginSuccess(realm, url.query.email, apiKey));
    }
  };

  handleDevAuth = () => {
    this.props.dispatch(navigateToDev());
  };

  handlePassword = () => {
    const { serverSettings } = this.props.navigation.state.params;
    this.props.dispatch(navigateToPassword(serverSettings.require_email_format_usernames));
  };

  handleGoogle = () => {
    // Server versions through 2.0 accept only this URL for Google auth.
    // Since server commit 2.0.0-2478-ga43b231f9 , both this URL and the new
    // accounts/login/social/google are accepted; see zulip/zulip#13081 .
    this.beginOAuth('accounts/login/google/');
  };

  handleGitHub = () => {
    this.beginOAuth('accounts/login/social/github');
  };

  handleAzureAD = () => {
    this.beginOAuth('/accounts/login/social/azuread-oauth2');
  };

  handleSso = () => {
    this.beginOAuth('accounts/login/sso/');
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
            <ZulipButton
              key={auth.method}
              style={styles.halfMarginTop}
              secondary
              text={`Log in with ${auth.name}`}
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

export default connect(state => ({
  realm: getCurrentRealm(state),
}))(AuthScreen);
