/* @flow strict-local */
import { NativeModules, Platform, Linking } from 'react-native';

export default (url: string): void => {
  if (Platform.OS === 'ios') {
    Linking.openURL(url); //open url in the browser
  } else {
    NativeModules.CustomTabsAndroid.openURL(url); //open url in the embedded webview
  }
};
