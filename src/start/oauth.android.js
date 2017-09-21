/* @flow */
import { NativeModules } from 'react-native';
import SafariView from 'react-native-safari-view';

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

export const openBrowser = (url: string, otp: any) => {
  SafariView.show({ url: `${url}?mobile_flow_otp=${otp}` });
};

export const closeBrowser = () => {
  SafariView.dismiss();
};
