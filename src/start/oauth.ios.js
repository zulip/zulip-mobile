/* @flow */
import { NativeModules } from 'react-native';
import SafariView from 'react-native-safari-view';
import randomBytes from 'react-native-randombytes';

import { base64ToHex } from '../utils/encoding';

// Generate a one time pad (OTP) which the server XORs the API key with
// in its response to protect against credentials intercept
export const generateOtp = async () => {
  const rand = await NativeModules.UtilManager.randomBase64(32);
  const rand2 = randomBytes(32);
  console.log('rand', rand, rand2);
  return base64ToHex(rand);
};

export const openBrowser = (url: string, otp: any) => {
  SafariView.show({ url: `${url}?mobile_flow_otp=${otp}` });
};

export const closeBrowser = () => {
  SafariView.dismiss();
};
