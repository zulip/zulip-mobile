import { NativeModules } from 'react-native';
import DeviceInfo from 'react-native-device-info';

const { getVersion, getSystemName, getSystemVersion } = DeviceInfo;

export default !NativeModules.RNDeviceInfo ?
  '' :
  `ZulipInvalid/${getVersion()} (${getSystemName()} ${getSystemVersion()})`;
