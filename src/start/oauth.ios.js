/* @flow strict-local */
import { NativeModules } from 'react-native';
import SafariView from 'react-native-safari-view';

import { base64ToHex } from '../utils/encoding';

// Generate a one time pad (OTP) which the server XORs the API key with
// in its response to protect against credentials intercept
export const generateOtp = async () => {
  const rand = await NativeModules.UtilManager.randomBase64(32);
  return base64ToHex(rand);
};

export const openBrowser = (url: string, otp: string) => {
  SafariView.show({ url: `${url}?mobile_flow_otp=${otp}` });
};

export const closeBrowser = () => {
  SafariView.dismiss();
};
