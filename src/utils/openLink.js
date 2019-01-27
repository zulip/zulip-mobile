/* @flow strict-local */
import { NativeModules, Platform } from 'react-native';
import SafariView from 'react-native-safari-view';

export default (url: string): void => {
  if (Platform.OS === 'ios') {
    url.replace(/\\/g, '/'); // Fix for #3315
    SafariView.show({ url });
  } else {
    NativeModules.CustomTabsAndroid.openURL(url);
  }
};
