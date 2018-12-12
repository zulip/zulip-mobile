/* @flow */
import { NativeModules } from 'react-native';

import openLink from '../utils/openLink';
import { base64ToHex } from '../utils/encoding';

export const generateOtp = async () =>
  new Promise((resolve, reject) => {
    NativeModules.RNSecureRandom.randomBase64(32, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(base64ToHex(result));
    });
  });

export const openBrowser = (url: string, otp: string) => {
  openLink(`${url}?mobile_flow_otp=${otp}`);
};

export const closeBrowser = () => {
  NativeModules.CloseAllCustomTabsAndroid.closeAll();
};
