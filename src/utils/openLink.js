/* @flow strict-local */
import { NativeModules, Platform, Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

import type { BrowserPreference, GlobalSettingsState } from '../types';

/** Open a URL in the in-app browser. */
// TODO(#4146): Take a URL object, not a string.
export function openLinkEmbedded(url: string): void {
  if (Platform.OS === 'ios') {
    WebBrowser.openBrowserAsync(encodeURI(url));
  } else {
    NativeModules.CustomTabsAndroid.openURL(url);
  }
}

/** Open a URL in the user's default browser app. */
// TODO(#4146): Take a URL object, not a string.
export function openLinkExternal(url: string): void {
  Linking.openURL(url);
}

export function shouldUseInAppBrowser(browser: BrowserPreference): boolean {
  if (browser === 'default') {
    return Platform.OS === 'android';
  } else {
    return browser === 'embedded';
  }
}

/** Open a URL using whichever browser the user has configured in the Zulip settings. */
// TODO(#4146): Take a URL object, not a string.
export function openLinkWithUserPreference(url: string, settings: GlobalSettingsState): void {
  if (shouldUseInAppBrowser(settings.browser)) {
    openLinkEmbedded(url);
  } else {
    openLinkExternal(url);
  }
}
