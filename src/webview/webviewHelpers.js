/* @flow */

import { Platform } from 'react-native';

export const baseUrl = Platform.OS === 'ios' ? './' : 'file:///android_asset/webview/';

export const getWebviewResource = (resource: string): string =>
  Platform.OS === 'ios' ? `./${resource}` : `file:///android_asset/webview/${resource}`;
