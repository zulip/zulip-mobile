/* @flow strict-local */
import { Linking, NativeModules, Platform } from 'react-native';

export default (url: string): void => {
  if (Platform.OS === 'ios') {
    Linking.openURL(url);
  } else {
    NativeModules.CustomTabsAndroid.openURL(url);
  }
