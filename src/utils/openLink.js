/* @flow strict-local */
import { NativeModules, Platform } from 'react-native';
import SafariView from 'react-native-safari-view';

// see https://github.com/facebook/react-native/issues/14796
import { Buffer } from 'buffer';

// see https://github.com/facebook/react-native/issues/16434
// eslint-disable-next-line import/no-extraneous-dependencies
import { URL } from 'whatwg-url'; 

import { showToast } from './info';

global.Buffer = Buffer;

export default (url: string): void => {
  // this url can be invalid
  try {
    if (Platform.OS === 'ios') {
      SafariView.show({ url: new URL(url).href });
    } else {
      NativeModules.CustomTabsAndroid.openURL(url);
    }
  } catch (e) {
    showToast(`Invalid url: ${url}`);
  }
};
