/* @flow strict-local */
import { nativeApplicationVersion } from 'expo-application';
import { Platform } from 'react-native';

import { androidRelease } from '../reactNativeUtils';

const systemName =
  // prettier-ignore
  Platform.OS === 'ios'
    // Probably "iOS" on all iOS devices we support (was "iPhone OS" long ago):
    //   https://github.com/facebook/react-native/blob/v0.68.5/React/CoreModules/RCTPlatform.mm#L68
    //   https://developer.apple.com/documentation/uikit/uidevice/1620054-systemname?language=objc
    ? Platform.constants.systemName
    : 'Android';

const systemVersion =
  // prettier-ignore
  Platform.OS === 'ios'
    // E.g. "16.4" for iOS 16.4:
    //   https://github.com/facebook/react-native/blob/v0.68.5/React/CoreModules/RCTPlatform.mm#L67
    //   https://developer.apple.com/documentation/uikit/uidevice/1620043-systemversion?language=objc
    ? `${Platform.constants.osVersion}`
    // (E.g. '13' for Android 13 Tiramisu)
    :  androidRelease();

export default `ZulipMobile/${
  nativeApplicationVersion ?? '?.?.?'
} (${systemName} ${systemVersion})`;
