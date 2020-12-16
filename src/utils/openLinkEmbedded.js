/* @flow strict-local */
import { NativeModules, Platform } from 'react-native';
import SafariView from 'react-native-safari-view';

export default (url: string): void => {
  if (Platform.OS === 'ios') {
    SafariView.show({ url: encodeURI(url) }); //open link in embedded webview
  } else {
    NativeModules.CustomTabsAndroid.openURL(url); //open link in embedded webview
  }
};
