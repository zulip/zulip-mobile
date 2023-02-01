/* @flow strict-local */
import { NativeModules, Platform, Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import OpenNotification from 'react-native-open-notification';

import type { BrowserPreference, GlobalSettingsState } from '../types';

const { ZLPConstants } = NativeModules;

/** Open a URL in the in-app browser. */
export function openLinkEmbedded(url: URL): void {
  if (Platform.OS === 'ios') {
    WebBrowser.openBrowserAsync(url.toString());
  } else {
    NativeModules.CustomTabsAndroid.openURL(url.toString());
  }
}

/** Open a URL in the user's default browser app. */
export function openLinkExternal(url: URL): void {
  Linking.openURL(url.toString());
}

export function shouldUseInAppBrowser(browser: BrowserPreference): boolean {
  if (browser === 'default') {
    return Platform.OS === 'android';
  } else {
    return browser === 'embedded';
  }
}

/** Open a URL using whichever browser the user has configured in the Zulip settings. */
export function openLinkWithUserPreference(url: URL, settings: GlobalSettingsState): void {
  if (shouldUseInAppBrowser(settings.browser)) {
    openLinkEmbedded(url);
  } else {
    openLinkExternal(url);
  }
}

export function openSystemNotificationSettings() {
  if (Platform.OS === 'ios') {
    Linking.openURL(
      // Link directly to notification settings when iOS supports it
      // (15.4+). Otherwise, link to the regular settings, and the user
      // should get to notification settings with one tap from there.
      ZLPConstants['UIApplication.openNotificationSettingsURLString'] // New name, iOS 16.0+
        // TODO(ios-16.0): Remove use of old name
        ?? ZLPConstants.UIApplicationOpenNotificationSettingsURLString // Old name, iOS 15.4+
        // TODO(ios-15.4): Remove fallback.
        ?? ZLPConstants['UIApplication.openSettingsURLString'],
    );
  } else {
    // On iOS, react-native-open-notification doesn't support opening all
    // the way to *notification* settings. It does support that on
    // Android, so we use it here. The library is oddly named for one that
    // opens notification settings; perhaps one day we'll replace it with
    // our own code. But Greg points out that the implementation is small
    // and reasonable:
    //   https://github.com/zulip/zulip-mobile/pull/5627#discussion_r1058039648
    OpenNotification.open();
  }
}
