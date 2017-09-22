/* @flow */
import { NativeModules } from 'react-native';

export default (url: string) => NativeModules.CustomTabsAndroid.openURL(url);
