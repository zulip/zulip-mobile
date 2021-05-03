/* @flow strict-local */

import React, { PureComponent } from 'react';
import { Linking, Platform } from 'react-native';
import type { AppleAuthenticationCredential } from 'expo-apple-authentication';
import * as AppleAuthentication from 'expo-apple-authentication';

import type {
  ApiResponseServerSettings,
  AuthenticationMethods,
  ExternalAuthenticationMethod,
} from '../api/settings/getServerSettings';
import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import * as NavigationService from '../nav/NavigationService';
import config from '../config';
import type { Dispatch } from '../types';
import {
  IconApple,
  IconPrivate,
  IconGoogle,
  IconGitHub,
  IconWindows,
  IconTerminal,
} from '../common/Icons';
import type { SpecificIconType } from '../common/Icons';
import { connect } from '../react-redux';
import styles from '../styles';
import { Centerer, Screen, ZulipButton } from '../common';
import RealmInfo from './RealmInfo';
import { encodeParamsForUrl } from '../utils/url';
import * as webAuth from './webAuth';
import { loginSuccess, navigateToDevAuth, navigateToPasswordAuth } from '../actions';
import IosCompliantAppleAuthButton from './IosCompliantAppleAuthButton';
import openLink from '../utils/openLink';

/**
 * Describes a method for authenticating to the server.
 *
 * Different servers and orgs/realms accept different sets of auth methods,
 * described in the /server_settings response; see api.getServerSettings
 * and https://zulip.com/api/get-server-settings .
 */
type AuthenticationMethodDetails = {|
  /** An identifier-style name used in the /server_settings API. */
  name: string,

  /** A name to show in the UI. */
  displayName: string,

  Icon: SpecificIconType,
  action: 'dev' | 'password' | {| url: string |},
|};

// Methods that don't show up in external_authentication_methods.
const availableDirectMethods: AuthenticationMethodDetails[] = [
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
    // This one might move to external_authentication_methods in the future.
    name: 'remoteuser',
    displayName: 'SSO',
    Icon: IconPrivate,
    action: { url: 'accounts/login/sso/' },
  },
];

// Methods that are covered in external_authentication_methods by servers
// which have that key (Zulip Server v2.1+).  We refer to this array for
// servers that don't.
const availableExternalMethods: AuthenticationMethodDetails[] = [
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
];

const externalMethodIcons = new Map([
  ['google', IconGoogle],
  ['github', IconGitHub],
  ['azuread', IconWindows],
  ['apple', IconApple],
]);

/** Exported for tests only. */
export const activeAuthentications = (
  authenticationMethods: AuthenticationMethods,
  externalAuthenticationMethods: ExternalAuthenticationMethod[] | void,
): AuthenticationMethodDetails[] => {
  const result = [];

  availableDirectMethods.forEach(auth => {
    if (!authenticationMethods[auth.name]) {
      return;
    }
    if (auth.name === 'ldap' && authenticationMethods.password === true) {
      // For either of these, we show a button that looks and behaves
      // exactly the same.  When both are enabled, dedupe them.
      return;
    }
    result.push(auth);
  });

  if (!externalAuthenticationMethods) {
    // Server doesn't speak new API; get these methods from the old one.
    availableExternalMethods.forEach(auth => {
      if (authenticationMethods[auth.name]) {
        result.push(auth);
      }
    });
  } else {
    // We have info from new API; ignore old one for these methods.
    externalAuthenticationMethods.forEach(method => {
      if (result.some(({ name }) => name === method.name)) {
        // Ignore duplicate.
        return;
      }

      // The server provides icons as image URLs; but we have our own built
      // in, which we don't have to load and can color to match the button.
      // TODO perhaps switch to server's, for the sake of SAML where ours is
      //   generic and the server may have a more specific one.
      const Icon = externalMethodIcons.get(method.name) ?? IconPrivate;

      result.push({
        name: method.name,
        displayName: method.display_name,
        Icon,
        action: { url: method.login_url },
      });
    });
  }

  return result;
};

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'auth'>,
  route: RouteProp<'auth', {| serverSettings: ApiResponseServerSettings |}>,

  dispatch: Dispatch,
  realm: URL,
|}>;

let otp = '';

/**
 * An event emitted by `Linking`.
 *
 * Determined by reading the implementation source code, and documentation:
 *   https://reactnative.dev/docs/linking
 *
 * TODO move this to a libdef, and/or get an explicit type into upstream.
 */
type LinkingEvent = {
  url: string,
  ...
};

class AuthScreen extends PureComponent<Props> {
  componentDidMount = () => {
    Linking.addEventListener('url', this.endWebAuth);
    Linking.getInitialURL().then((initialUrl: ?string) => {
      if (initialUrl !== null && initialUrl !== undefined) {
        this.endWebAuth({ url: initialUrl });
      }
    });

    const { serverSettings } = this.props.route.params;
    const authList = activeAuthentications(
      serverSettings.authentication_methods,
      serverSettings.external_authentication_methods,
    );
    if (authList.length === 1) {
      this.handleAuth(authList[0]);
    }
  };

  componentWillUnmount = () => {
    Linking.removeEventListener('url', this.endWebAuth);
  };

  /**
   * Hand control to the browser for an external auth method.
   *
   * @param url The `login_url` string, a relative URL, from an
   * `external_authentication_method` object from `/server_settings`.
   */
  beginWebAuth = async (url: string) => {
    otp = await webAuth.generateOtp();
    webAuth.openBrowser(new URL(url, this.props.realm).toString(), otp);
  };

  endWebAuth = (event: LinkingEvent) => {
    webAuth.closeBrowser();

    const { dispatch, realm } = this.props;
    const auth = webAuth.authFromCallbackUrl(event.url, otp, realm);
    if (auth) {
      dispatch(loginSuccess(auth.realm, auth.email, auth.apiKey));
    }
  };

  handleDevAuth = () => {
    NavigationService.dispatch(navigateToDevAuth({ realm: this.props.realm }));
  };

  handlePassword = () => {
    const { serverSettings } = this.props.route.params;
    const { realm } = this.props;
    NavigationService.dispatch(
      navigateToPasswordAuth({
        realm,
        requireEmailFormat: serverSettings.require_email_format_usernames,
      }),
    );
  };

  handleNativeAppleAuth = async () => {
    const state = await webAuth.generateRandomToken();
    const credential: AppleAuthenticationCredential = await AppleAuthentication.signInAsync({
      state,
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    if (credential.state !== state) {
      throw new Error('`state` mismatch');
    }

    otp = await webAuth.generateOtp();

    const params = encodeParamsForUrl({
      mobile_flow_otp: otp,
      native_flow: true,
      id_token: credential.identityToken,
    });

    openLink(new URL(`/complete/apple/?${params}`, this.props.realm).toString());

    // Currently, the rest is handled with the `zulip://` redirect,
    // same as in the web flow.
    //
    // TODO: Maybe have an endpoint we can just send a request to,
    // with `fetch`, and get the API key right away, without ever
    // having to open the browser.
  };

  canUseNativeAppleFlow = async () => {
    if (!(Platform.OS === 'ios' && (await AppleAuthentication.isAvailableAsync()))) {
      return false;
    }

    const { host } = this.props.realm;

    // The native flow for Apple auth assumes that the app and the server
    // are operated by the same organization, so that for a user to
    // entrust private information to either one is the same as entrusting
    // it to the other.  Check that this realm is on such a server.
    //
    // (For other realms, we'll simply fall back to the web flow, which
    // handles things appropriately without relying on that assumption.)
    return config.appOwnDomains.some(domain => host === domain || host.endsWith(`.${domain}`));
  };

  handleAuth = async (method: AuthenticationMethodDetails) => {
    const { action } = method;

    if (action === 'dev') {
      this.handleDevAuth();
    } else if (action === 'password') {
      this.handlePassword();
    } else if (method.name === 'apple' && (await this.canUseNativeAppleFlow())) {
      this.handleNativeAppleAuth();
    } else {
      this.beginWebAuth(action.url);
    }
  };

  render() {
    const { serverSettings } = this.props.route.params;

    return (
      <Screen title="Log in" centerContent padding shouldShowLoadingBanner={false}>
        <Centerer>
          <RealmInfo
            name={serverSettings.realm_name}
            iconUrl={new URL(serverSettings.realm_icon, this.props.realm).toString()}
          />
          {activeAuthentications(
            serverSettings.authentication_methods,
            serverSettings.external_authentication_methods,
          ).map(auth =>
            auth.name === 'apple' && Platform.OS === 'ios' ? (
              <IosCompliantAppleAuthButton
                key={auth.name}
                style={styles.halfMarginTop}
                onPress={() => this.handleAuth(auth)}
              />
            ) : (
              <ZulipButton
                key={auth.name}
                style={styles.halfMarginTop}
                secondary
                text={{
                  text: 'Sign in with {method}',
                  values: { method: auth.displayName },
                }}
                Icon={auth.Icon}
                onPress={() => this.handleAuth(auth)}
              />
            ),
          )}
        </Centerer>
      </Screen>
    );
  }
}

export default connect((state, props) => ({
  // Not from the Redux state, but it's convenient to validate the URL
  // in one central place, like here.
  realm: new URL(props.route.params.serverSettings.realm_uri),
}))(AuthScreen);
