/* @flow strict-local */
import { NativeModules, Platform } from 'react-native';
import SafariView from 'react-native-safari-view';

import invariant from 'invariant';
import type { Auth, Dispatch, LinkingEvent } from '../types';
import { openLinkEmbedded } from '../utils/openLink';
import { tryParseUrl } from '../utils/url';
import { base64ToHex, hexToAscii, xorHexStrings } from '../utils/encoding';
import { loginSuccess } from '../account/accountActions';

/*
  Logic for authenticating the user to Zulip through a browser.

  Specifically, this handles auth flows we don't know the specifics of
  here in the app's code.

  To handle that, we send the user to some URL in a browser, so they can go
  through whatever flow the server (or an auth provider it redirects them to
  in turn) wants to take them through.

  To close the loop when the authentication is complete, there's a
  particular protocol we carry out with the Zulip server, involving
  `zulip://` URLs and XOR-ing with a one-time pad named `mobile_flow_otp`.

  No docs on this protocol seem to exist.  But see:
   * the implementations here and in the server
   * this 2019 chat message with a nice list of the steps:
       https://chat.zulip.org/#narrow/stream/16-desktop/topic/desktop.20app.20OAuth/near/803919
 */

let otp = '';

export const generateRandomToken = async (): Promise<string> => {
  if (Platform.OS === 'android') {
    return new Promise((resolve, reject) => {
      NativeModules.RNSecureRandom.randomBase64(32, (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(base64ToHex(result));
      });
    });
  } else {
    const rand = await NativeModules.UtilManager.randomBase64(32);
    return base64ToHex(rand);
  }
};

// Generate a one time pad (OTP) which the server XORs the API key with
// in its response to protect against credentials intercept
export const generateOtp = async (): Promise<string> => {
  otp = await generateRandomToken();
  return otp;
};

const openBrowser = (url: string) => {
  openLinkEmbedded(`${url}?mobile_flow_otp=${otp}`);
};

const closeBrowser = () => {
  if (Platform.OS === 'android') {
    NativeModules.CloseAllCustomTabsAndroid.closeAll();
  } else {
    SafariView.dismiss();
  }
};

/**
 * Decode an API key from the Zulip mobile-auth-via-web protocol.
 *
 * Corresponds to `otp_decrypt_api_key` on the server.
 */
const extractApiKey = (encoded: string) => hexToAscii(xorHexStrings(encoded, otp));

export const authFromCallbackUrl = (
  callbackUrl: string,
  realm: URL,
  customOtp?: string,
): Auth | null => {
  if (customOtp !== undefined) {
    otp = customOtp;
  }
  // callback format expected: zulip://login?realm={}&email={}&otp_encrypted_api_key={}
  const url = tryParseUrl(callbackUrl);
  if (!url) {
    return null;
  }

  const callbackRealmStr = url.searchParams.get('realm');
  if (callbackRealmStr === null) {
    return null;
  }
  const callbackRealm = tryParseUrl(callbackRealmStr);
  if (!callbackRealm || callbackRealm.origin !== realm.origin) {
    return null;
  }

  const email = url.searchParams.get('email');
  const otpEncryptedApiKey = url.searchParams.get('otp_encrypted_api_key');

  if (
    url.host === 'login'
    && otp
    && email !== null
    && otpEncryptedApiKey !== null
    && otpEncryptedApiKey.length === otp.length
  ) {
    const apiKey = extractApiKey(otpEncryptedApiKey);
    return { realm, email, apiKey };
  }

  return null;
};

/**
 * Hand control to the browser for an external auth method.
 *
 * @param url The `login_url` string, a relative URL, from an
 * `external_authentication_method` object from `/server_settings`.
 * @param realm URL of the realm for which webAuth needs to begin.
 */
export const beginWebAuth = async (url: string, realm: URL) => {
  await generateOtp();
  openBrowser(new URL(url, realm).toString());
};

/**
 * Meant to be triggered by incoming app link that contains auth
 * information.
 *
 * @param event React Native Linking 'url' event.
 * @param dispatch function to dispatch action.
 */
export const endWebAuth = (event: LinkingEvent, dispatch: Dispatch) => {
  closeBrowser();

  const encodedRealm = event.url
    .split('?')
    .pop()
    .split('&')
    .map(param => param.split('='))
    .find(x => x[0] === 'realm');
  invariant(
    encodedRealm !== undefined,
    'URL received from web auth must contain realm as parameter.',
  );
  const decodedRealm = new URL(decodeURIComponent(encodedRealm[1]));
  const auth = authFromCallbackUrl(event.url, decodedRealm);
  if (auth) {
    dispatch(loginSuccess(auth.realm, auth.email, auth.apiKey));
  }
};
