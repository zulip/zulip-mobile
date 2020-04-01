/* @flow strict-local */
import { NativeModules } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { nativeApplicationVersion } from 'expo-application';

const { getSystemName, getSystemVersion } = DeviceInfo;

export default !NativeModules.RNDeviceInfo
  ? ''
  : `ZulipMobile/${nativeApplicationVersion ?? '?.?.?'} (${getSystemName()} ${getSystemVersion()})`;
