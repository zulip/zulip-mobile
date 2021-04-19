/* @flow strict-local */
import { NativeModules, Platform, Linking } from 'react-native';
import SafariView from 'react-native-safari-view';

export function openLinkEmbedded(url: string): void {
  if (Platform.OS === 'ios') {
    SafariView.show({ url: encodeURI(url) });
  } else {
    NativeModules.CustomTabsAndroid.openURL(url);
  }
}

export function openLinkExternal(url: string): void {
  Linking.openURL(url);
}
