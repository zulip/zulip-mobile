/* @flow */

import { Platform } from 'react-native';

export const baseUrl = Platform.OS === 'ios' ? './' : 'file:///android_asset/webview/';
