/* @flow strict-local */
import DeviceInfo from 'react-native-device-info';
import { nativeApplicationVersion } from 'expo-application';

const { getSystemName, getSystemVersion } = DeviceInfo;

export default `ZulipMobile/${nativeApplicationVersion
  ?? '?.?.?'} (${getSystemName()} ${getSystemVersion()})`;
