/* @flow */
import { NativeModules } from 'react-native';

const openLink = (url: string) => NativeModules.CustomTabsAndroid.openURL(url);

export default openLink;
