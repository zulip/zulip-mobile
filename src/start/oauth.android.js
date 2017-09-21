/* @flow */
import SafariView from 'react-native-safari-view';

export const generateOtp = async () => '123';

export const openBrowser = (url: string, otp: any) => {
  SafariView.show({ url: `${url}?mobile_flow_otp=${otp}` });
};

export const closeBrowser = () => {
  SafariView.dismiss();
};
