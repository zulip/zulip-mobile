/* @flow strict-local */
import { NativeModules, Platform } from 'react-native';
import SafariView from 'react-native-safari-view';

import openLink from '../utils/openLink';
import { base64ToHex } from '../utils/encoding';

/* eslint-disable no-else-return */

// Generate a one time pad (OTP) which the server XORs the API key with
// in its response to protect against credentials intercept
export const generateOtp = async () => {
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

export const openBrowser = (url: string, otp: string) => {
  openLink(`${url}?mobile_flow_otp=${otp}`);
};

export const closeBrowser = () => {
  if (Platform.OS === 'android') {
    NativeModules.CloseAllCustomTabsAndroid.closeAll();
  } else {
    SafariView.dismiss();
  }
};
