/* @flow strict-local */
import { NativeModules } from 'react-native';
import DeviceInfo from 'react-native-device-info';

const { getVersion, getSystemName, getSystemVersion } = DeviceInfo;

export default (!NativeModules.RNDeviceInfo
  ? ''
  : `ZulipMobile/${getVersion()} (${getSystemName()} ${getSystemVersion()})`);
