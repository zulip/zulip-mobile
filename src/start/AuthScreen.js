/* @flow strict-local */

import React, { PureComponent } from 'react';
import { Linking } from 'react-native';
import parseURL from 'url-parse';
import type { NavigationScreenProp } from 'react-navigation';

import type { AuthenticationMethods, Dispatch, ApiResponseServerSettings } from '../types';
import { IconPrivate, IconGoogle, IconGitHub, IconWindows, IconTerminal } from '../common/Icons';
import type { IconType } from '../common/Icons';
import { connect } from '../react-redux';
import styles from '../styles';
import { Centerer, Screen, ZulipButton } from '../common';
import { getCurrentRealm } from '../selectors';
import RealmInfo from './RealmInfo';
import { getFullUrl } from '../utils/url';
import { extractApiKey } from '../utils/encoding';
import * as webAuth from './webAuth';
import { loginSuccess, navigateToDev, navigateToPassword } from '../actions';

/**
 * Describes a method for authenticating to the server.
 *
 * Different servers and orgs/realms accept different sets of auth methods,
 * described in the /server_settings response; see api.getServerSettings
 * and https://zulipchat.com/api/server-settings .
 */
type AuthenticationMethodDetails = {|
  /** An identifier-style name used in the /server_settings API. */
  name: string,

  /** A name to show in the UI. */
  displayName: string,

  Icon: IconType,
  action: 'dev' | 'password' | {| url: string |},
|};

const authentications: AuthenticationMethodDetails[] = [
  {
    name: 'dev',
    displayName: 'dev account',
    Icon: IconTerminal,
    action: 'dev',
  },
  {
    name: 'password',
    displayName: 'password',
    Icon: IconPrivate,
    action: 'password',
  },
  {
    name: 'ldap',
    displayName: 'password',
    Icon: IconPrivate,
    action: 'password',
  },
  {
    name: 'google',
    displayName: 'Google',
    Icon: IconGoogle,
    // Server versions through 2.0 accept only this URL for Google auth.
    // Since server commit 2.0.0-2478-ga43b231f9 , both this URL and the new
    // accounts/login/social/google are accepted; see zulip/zulip#13081 .
    action: { url: 'accounts/login/google/' },
  },
  {
    name: 'github',
    displayName: 'GitHub',
    Icon: IconGitHub,
    action: { url: 'accounts/login/social/github' },
  },
  {
    name: 'azuread',
    displayName: 'Azure AD',
    Icon: IconWindows,
    action: { url: '/accounts/login/social/azuread-oauth2' },
  },
  {
    name: 'remoteuser',
    displayName: 'SSO',
    Icon: IconPrivate,
    action: { url: 'accounts/login/sso/' },
  },
];

/** Exported for tests only. */
export const activeAuthentications = (
  authenticationMethods: AuthenticationMethods,
): AuthenticationMethodDetails[] =>
  authentications.filter(
    auth =>
      authenticationMethods[auth.name] && (auth.name !== 'ldap' || !authenticationMethods.password),
  );

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
    Linking.addEventListener('url', this.endWebAuth);
    Linking.getInitialURL().then((initialUrl: ?string) => {
      if (initialUrl !== null && initialUrl !== undefined) {
        this.endWebAuth({ url: initialUrl });
      }
    });

    const authList = activeAuthentications(
      this.props.navigation.state.params.serverSettings.authentication_methods,
    );
    if (authList.length === 1) {
      this.handleAuth(authList[0]);
    }
  };

  componentWillUnmount = () => {
    Linking.removeEventListener('url', this.endWebAuth);
  };

  beginWebAuth = async (url: string) => {
    otp = await webAuth.generateOtp();
    webAuth.openBrowser(`${this.props.realm}/${url}`, otp);
  };

  endWebAuth = (event: LinkingEvent) => {
    webAuth.closeBrowser();

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

  handleAuth = (method: AuthenticationMethodDetails) => {
    const { action } = method;
    if (action === 'dev') {
      this.handleDevAuth();
    } else if (action === 'password') {
      this.handlePassword();
    } else {
      this.beginWebAuth(action.url);
    }
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
              key={auth.name}
              style={styles.halfMarginTop}
              secondary
              text={`Log in with ${auth.displayName}`}
              Icon={auth.Icon}
              onPress={() => this.handleAuth(auth)}
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
